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
    await this.notificationService.handleConnection(client, this.io);
  }

  sendNotification(userId: number) {
    this.logger.log(`Sending notification to user id: ${userId}`);
    this.io.to(userId.toString()).emit('notification', { data: 'hello!' });
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
