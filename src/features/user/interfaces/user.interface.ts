import mongoose, { Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IUserDocument extends Document {
  _id: string | Types.ObjectId;
  authId: string | Types.ObjectId;
  username?: string;
  password?: string;
  email?: string;
  uId?: string;
  avatarColor?: string;
  work: string;
  school: string;
  quote: string;
  location: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  blocked: Types.ObjectId[];
  blockedBy: Types.ObjectId[];
  social: ISocialLinks;
  notifications: INotificationSettings;
  bgImageVersion: string;
  bgImageId: string;
  profilePicture: string;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  createdAt?: Date;
}

export interface IResetPasswordParams {
  username: string;
  email: string;
  ipaddress: string;
  date: string;
}

export interface INotificationSettings {
  messages: boolean;
  reactions: boolean;
  comments: boolean;
  follows: boolean;
}

export interface IBaseInfo {
  quote: string;
  work: string;
  school: string;
  location: string;
}

export interface ISocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

export interface ISearchUser {
  _id: string;
  profilePicture: string;
  username: string;
  email: string;
  avatarColor: string;
}

export interface ISocketData {
  blockedUser: string;
  blockedBy: string;
}

export interface ILogin {
  userId: string;
}

export interface IUserJobInfo {
  key?: string;
  value?: string | ISocialLinks;
}

export interface IUserJob {
  keyOne?: string;
  keyTwo?: string;
  key?: string;
  value?: string | INotificationSettings | IUserDocument;
}

export interface IAllUsers {
  users: IUserDocument[];
  totalUsers: number;
}

export interface IEmailJob {
  receiverEmail: string;
  template: string;
  subject: string;
}
