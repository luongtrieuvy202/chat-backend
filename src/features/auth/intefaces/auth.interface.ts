import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { IUserDocument } from 'src/features/user/interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload;
    }
  }
}

export interface AuthPayload {
  userId: string;
  uId: string;
  email: string;
  username: string;
  avatarColor: string;
  iat?: number;
}

export interface IAuthDocument extends Document {
  _id: string | Types.ObjectId;
  uId: string;
  username: string;
  email: string;
  password?: string;
  avatarColor: string;
  createdAt: Date;
  passwordResetExpires: string | undefined;
  passwordResetToken:string | undefined;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface ISignUpData {
  _id: Types.ObjectId;
  uId: string;
  email: string;
  username: string;
  password: string;
  avatarColor: string;
}

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument;
}
