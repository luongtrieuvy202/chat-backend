import { Types } from 'mongoose';
import { Request, Response } from 'express';
import { joiValidation } from 'src/shared/globals/decorators/joi-validation.decorators';
import { signupSchema } from '../schemas/signup';
import { IAuthDocument, ISignUpData } from '../intefaces/auth.interface';
import { authService } from 'src/shared/services/db/auth.service';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';
import { Helpers } from 'src/shared/globals/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from 'src/shared/globals/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from 'src/shared/services/redis/user.cache';
import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { omit } from 'lodash';
import { authQueue } from 'src/shared/services/queues/auth.queue';
import { userQueue } from 'src/shared/services/queues/user.queue';
import JWT from 'jsonwebtoken';
import { config } from 'src/config';

const userCache: UserCache = new UserCache();

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials');
    }

    const authObjectId: Types.ObjectId = new Types.ObjectId();
    const userObjectId: Types.ObjectId = new Types.ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;

    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });

    const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;

    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occurred. Try again.');
    }

    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/dlqklr9xo/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
    authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });
    userQueue.addUserJob('addUserToDB', { value: userDataForCache });
    const authJwt: string = SignUp.prototype.signToken(authData, userObjectId);
    req.session = { jwt: authJwt };

    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: userDataForCache, token: authJwt });
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;

    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: Types.ObjectId): IUserDocument {
    const { _id, username, uId, email, password, avatarColor } = data;

    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageId: '',
      bgImageVersion: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }

  private signToken(data: IAuthDocument, userObjectId: Types.ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN
    );
  }
}
