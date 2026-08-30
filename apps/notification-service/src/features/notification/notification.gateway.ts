import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { NotificationService } from '@features/notification/notification.service';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly notificationService: NotificationService) {}
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer() io: Server;

  afterInit() {
    this.logger.log('Notification WS initialized');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const userId = await this.notificationService.authenticate(client);

    if (userId === null) {
      client.disconnect();

      return;
    }

    await client.join(this.getUserRoom(userId));
  }

  private getUserRoom(userId: number): string {
    return userId.toString();
  }

  sendNotification(userId: number) {
    this.logger.log(`Sending notification to user id: ${userId}`);
    this.io
      .to(this.getUserRoom(userId))
      .emit('notification', { data: 'hello!' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client id:${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handleMessage(client: Socket, data: string) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${data}`);
    return {
      event: 'pong',
      data: 'Wrong data that will make the test fail',
    };
  }
}
