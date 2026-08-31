import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { TokenModule } from '@libs/token/token.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TransferNotification,
  TransferNotificationSchema,
} from '@features/notification/schemas/transfer-notification.schema';

@Module({
  imports: [
    TokenModule,
    MongooseModule.forFeature([
      { name: TransferNotification.name, schema: TransferNotificationSchema },
    ]),
  ],
  providers: [NotificationGateway, NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
