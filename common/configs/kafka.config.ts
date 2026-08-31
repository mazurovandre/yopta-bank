import { registerAs } from '@nestjs/config';

export const kafkaConfig = registerAs('kafka', () => ({
  host: process.env.KAFKA_HOST,
  port: parseInt(process.env.KAFKA_PORT || '9092', 10),
}));
