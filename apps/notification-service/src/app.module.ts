import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationModule } from '@features/notification/notification.module';
import { kafkaConfig } from '@common/configs/kafka.config';
import { MongooseModule } from '@nestjs/mongoose';
import { databaseConfig } from './configs/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [kafkaConfig, databaseConfig],
    }),
    NotificationModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('database.host');
        const port = +configService.get('database.port');
        const username = configService.get<string>('database.username');
        const password = configService.get<string>('database.password');
        const database = configService.get<string>('database.database');

        return {
          uri: `mongodb://${username}:${password}@${host}:${port}/${database}`,
          authSource: 'admin',
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
