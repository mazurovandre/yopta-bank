import { Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationGateway } from '@features/notification/notification.gateway';
import { Request } from 'express';
import { AuthGuard } from '../../../../user-service/src/auth/auth.guard';

@Controller('notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  private readonly logger = new Logger(NotificationController.name);

  @Post()
  notify(@Req() request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const userId = request['user']['sub'];
    this.logger.log(`Notification sent ${userId}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.notificationGateway.sendNotification(userId);
  }
}
