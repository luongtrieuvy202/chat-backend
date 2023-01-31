import { Response, Request } from 'express';
import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { userService } from 'src/shared/services/db/user.service';
import { UserCache } from 'src/shared/services/redis/user.cache';
import HTTP_STATUS from 'http-status-codes';

const userCache: UserCache = new UserCache();

export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;

    const cachedUser = null; //: IUserDocument = await userCache.getUserFromCache(`${req.currentUser!.userId}`) as IUserDocument;
    const existingUser: IUserDocument = await userService.getUserById(`${req.currentUser!.userId}`);

    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }

    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}
