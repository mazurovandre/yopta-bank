import { registerAs } from '@nestjs/config';

export const cacheConfig = registerAs('cache', () => ({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  ttl: parseInt(process.env.CACHE_TTL_MS || '30000', 10),
}));
