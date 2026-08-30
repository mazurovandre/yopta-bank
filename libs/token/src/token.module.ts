import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [TokenService, JwtService],
  exports: [TokenService],
  imports: [
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
export class TokenModule {}
