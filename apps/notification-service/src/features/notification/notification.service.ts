import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../../../user-service/src/auth/jwt-payload.interface';

@Injectable()
export class NotificationService {
  constructor(private readonly jwtService: JwtService) {}

  private readonly logger = new Logger(NotificationService.name);

  async handleConnection(client: Socket, io: Server) {
    const { sockets } = io.sockets;
    this.logger.log(`Client connected: ${client.id}, size ${sockets.size}`);
    let userId: number | null = null;

    try {
      const authHeader = this.extractTokenFromHeader(client);

      if (!authHeader) {
        throw new Error('No auth header');
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(authHeader);

      if (payload.type !== 'access') {
        this.logger.warn(
          `Access denied: wrong token type "${payload.type}" for user id=${payload.sub}`,
        );
        throw new UnauthorizedException();
      }

      userId = payload.sub;
      this.logger.log(`Logged in user: ${userId}`);
    } catch (err) {
      this.logger.error('Invalid auth', err);
      client.disconnect();

      return;
    }
    // Go to room
    client.join(userId.toString());
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
