import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { joiValidation } from 'src/shared/globals/decorators/joi-validation.decorators';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';
import { authService } from 'src/shared/services/db/auth.service';
import { userService } from 'src/shared/services/db/user.service';
import { IAuthDocument } from '../intefaces/auth.interface';
import { loginSchema } from '../schemas/signin';
import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { config } from 'src/config';
import HTTP_STATUS from 'http-status-codes';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordMatch: boolean = await existingUser.comparePassword(password);

    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN
    );

    req.session = { jwt: userJwt };

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as IUserDocument;

    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: userDocument, token: userJwt });
  }
}
