import { IUser } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      rawBody?: Buffer;
    }
  }
}

export {};
