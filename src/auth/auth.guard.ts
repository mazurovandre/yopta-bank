import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    let payload: JwtPayload;

    if (!token) {
      this.logger.warn(
        `Access denied: no bearer token for ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException();
    }

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : 'token verification failed';

      this.logger.warn(`Access denied: ${reason}`);
      throw new UnauthorizedException();
    }

    if (payload.type !== 'access') {
      this.logger.warn(
        `Access denied: wrong token type "${payload.type}" for user id=${payload.sub}`,
      );
      throw new UnauthorizedException();
    }

    request['user'] = payload;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
