import { Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationGateway } from '@features/notification/notification.gateway';
import { Request } from 'express';
import { TokenGuard } from '@libs/token/token.guard';

@UseGuards(TokenGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  private readonly logger = new Logger(NotificationController.name);

  @Post()
  notify(@Req() request: Request) {
    const userId = request['user']['sub'];
    this.logger.log(`Notification sent ${userId}`);

    return this.notificationGateway.sendNotification(userId);
  }
}
