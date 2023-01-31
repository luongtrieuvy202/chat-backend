import express, { Router } from 'express';
import { authMiddleware } from 'src/shared/globals/helpers/auth-middleware';
import { CurrentUser } from '../controllers/current-user';

export class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/currentUser', authMiddleware.checkAuthentication, CurrentUser.prototype.read);

    return this.router;
  }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes();
