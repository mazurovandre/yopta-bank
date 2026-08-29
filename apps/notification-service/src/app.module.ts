import { Module } from '@nestjs/common';
import { NotificationModule } from '@features/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
