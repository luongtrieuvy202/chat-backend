import { Request, Response } from 'express';
import { joiValidation } from 'src/shared/globals/decorators/joi-validation.decorators';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';
import { authService } from 'src/shared/services/db/auth.service';
import { IAuthDocument } from '../intefaces/auth.interface';
import { emailSchema, passwordSchema } from '../schemas/password';
import crypto from 'crypto';
import { config } from 'src/config';
import { forgotPasswordTemplate } from 'src/shared/services/emails/templates/forgot-password/forgot-template-password';
import { emailQueue } from 'src/shared/services/queues/email.queue';
import HTTP_STATUS from 'http-status-codes';
import moment from 'moment';
import publicIP from 'ip';
import { IResetPasswordParams } from 'src/features/user/interfaces/user.interface';
import { resetPasswordTemplate } from 'src/shared/services/emails/templates/reset-password/reset-password-template';

export class Password {
  @joiValidation(emailSchema)
  public async create(req:Request, res:Response):Promise<void> {
    const {email} = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);

    if(!existingUser){
      throw new BadRequestError('Invalid credentials');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    await authService.updatePasswordToken(`${existingUser._id}`,randomCharacters, Date.now()*60*60*1000);

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template:string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username, resetLink);
    emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail:email, subject: 'Reset your password'});
    res.status(HTTP_STATUS.OK).json({message:'Password reset email sent.'});
  }


  @joiValidation(passwordSchema)
  public async update(req:Request, res:Response):Promise<void> {
    const {password, confirmPassword} = req.body;

    if(password !== confirmPassword){
      throw new BadRequestError('Password do not match.');
    }

    const {token} = req.params;

    const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);

    if(!existingUser){
      throw new BadRequestError('Invalid credentials');
    }

    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;

    await existingUser.save();

    const templateParams:IResetPasswordParams = {
      username:existingUser.username!,
      email:existingUser.email!,
      ipaddress:publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };



    const template:string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail:existingUser.email, subject: 'Reset password successfully'});
    res.status(HTTP_STATUS.OK).json({message:'Password reset.'});
  }
}
