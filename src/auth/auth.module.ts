import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@features/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshSession } from './entities/refresh-session.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshSession]),
    JwtModule.registerAsync({
      global: true,
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          accessTTL: config.get<number>('JWT_ACCESS_EXPIRATION_TIME'),
          refreshTTL: config.get<number>('JWT_REFRESH_EXPIRATION_TIME'),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class AuthModule {}
