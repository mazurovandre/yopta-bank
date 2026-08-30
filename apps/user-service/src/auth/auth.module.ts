import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@features/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshSession } from './entities/refresh-session.entity';
import { TokenModule } from '@libs/token/token.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshSession]),
    TokenModule,
  ],
})
export class AuthModule {}
