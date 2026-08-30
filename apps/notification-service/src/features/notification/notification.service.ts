import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TokenService } from '@libs/token/token.service';
import { JwtPayload } from '@libs/token/interfaces/jwt-payload.interface';

@Injectable()
export class NotificationService {
  constructor(private readonly tokenService: TokenService) {}

  private readonly logger = new Logger(NotificationService.name);

  async authenticate(client: Socket): Promise<number | null> {
    let userId: number | null = null;

    try {
      const authHeader = this.extractTokenFromHeader(client);

      if (!authHeader) {
        throw new Error('No auth header');
      }

      const payload: JwtPayload =
        await this.tokenService.verifyAccessToken(authHeader);

      userId = payload.sub;
      this.logger.log(`Logged in user: ${userId}`);
    } catch (err) {
      this.logger.error('Invalid auth', err);

      return null;
    }

    return userId;
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const splitToken = client.handshake.headers.authorization?.split(' ') ?? [];

    if (splitToken[0] === 'Bearer') {
      return splitToken[1];
    }

    if (splitToken.length === 1) {
      return splitToken[0];
    }

    return undefined;
  }
}
