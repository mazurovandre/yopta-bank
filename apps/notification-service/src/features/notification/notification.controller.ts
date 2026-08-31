import { Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationGateway } from '@features/notification/notification.gateway';
import { Request } from 'express';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TransferBalance } from './interfaces/transfer-balance.interface';
import { AuthGuard } from '@libs/token/auth.guard';
import { TRANSFER_BALANCE_EVENT } from '@common/constants/transactions.constants';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  private readonly logger = new Logger(NotificationController.name);

  @UseGuards(AuthGuard)
  @Post()
  notify(@Req() request: Request) {
    const userId = request['user']['sub'];
    this.logger.log(`Notification sent ${userId}`);

    return this.notificationGateway.sendNotification(userId, 'This is fine');
  }

  @EventPattern(TRANSFER_BALANCE_EVENT)
  transferBalanceNotify(
    @Payload() { senderId, recipientId, amount }: TransferBalance,
  ) {
    return this.notificationGateway.sendNotification(
      recipientId,
      `Received ${amount}$ from userID=${senderId}`,
    );
  }
}
