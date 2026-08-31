import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const kafkaHost = configService.get<string>('kafka.host');
  const kafkaPort = configService.get<string>('kafka.port');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [`${kafkaHost}:${kafkaPort}`],
      },
      consumer: { groupId: 'notification-consumer' },
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.NOTIFICATION_PORT ?? 3001);
}

void bootstrap();
