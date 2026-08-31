import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '@features/notification/notification.module';
import { kafkaConfig } from '@common/configs/kafka.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [kafkaConfig] }),
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
