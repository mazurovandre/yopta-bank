import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '@features/users/users.module';
import { AuthModule } from '@auth/auth.module';
import { databaseConfig } from '@configs/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarsModule } from '@features/avatars/avatars.module';
import { CacheModule } from '@nestjs/cache-manager';
import { cacheConfig } from '@configs/cache.config';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, cacheConfig],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('cache.host');
        const port = configService.get<number>('cache.port');
        const password = configService.get<string>('cache.password');
        const ttl = configService.get<number>('cache.ttl');

        return {
          stores: [new KeyvRedis({ url: `redis://${host}:${port}`, password })],
          ttl,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: +configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: configService.get('database.entities'),
        synchronize: Boolean(configService.get('database.synchronize')),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    AvatarsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
