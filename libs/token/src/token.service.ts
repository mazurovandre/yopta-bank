import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(private readonly jwtService: JwtService) {}

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    const payload: JwtPayload = await this.jwtService.verifyAsync(token);

    if (payload.type !== 'access') {
      this.logger.warn(
        `Access denied: wrong token type "${payload.type}" for user id=${payload.sub}`,
      );
      throw new UnauthorizedException();
    }

    return payload;
  }
}
