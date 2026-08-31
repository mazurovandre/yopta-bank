import { JwtPayload } from '@libs/token/interfaces/jwt-payload.interface';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}
