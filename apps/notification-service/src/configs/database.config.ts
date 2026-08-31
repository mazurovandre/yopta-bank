import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  type: 'mongodb',
  database: process.env.MONGO_DATABASE,
  host: process.env.MONGO_HOST,
  port: parseInt(process.env.MONGO_PORT || '27018', 10),
  username: process.env.MONGO_USER,
  password: process.env.MONGO_PASSWORD,
}));
