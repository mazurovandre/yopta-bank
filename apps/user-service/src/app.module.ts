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
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { BullModule } from '@nestjs/bullmq';
import { BalanceResetModule } from '@features/balance-reset/balance-reset.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('cache.host');
        const port = configService.get<number>('cache.port');
        const password = configService.get<string>('cache.password');

        return {
          connection: { host, port, password },
        };
      },
      inject: [ConfigService],
    }),
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
          namespace: 'cache',
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
        autoLoadEntities: configService.get('database.autoLoadEntities'),
        synchronize: Boolean(configService.get('database.synchronize')),
      }),
      dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        const result = addTransactionalDataSource(new DataSource(options));

        return Promise.resolve(result);
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    AvatarsModule,
    BalanceResetModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
