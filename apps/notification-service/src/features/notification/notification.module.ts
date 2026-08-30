import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { TokenModule } from '@libs/token/token.module';

@Module({
  imports: [TokenModule],
  providers: [NotificationGateway, NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
