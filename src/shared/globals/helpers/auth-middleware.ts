import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { config } from 'src/config';
import { AuthPayload } from 'src/features/auth/intefaces/auth.interface';
import { NotAuthorizedError } from './error-handler';

export class AuthMiddleware {
  public verifyUser(req: Request, res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again.');
    }

    try {
      const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid. Please login again');
    }

    next();
  }

  public checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route.');
    }

    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
