import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { USERS_REPOSITORY } from '@features/users/repositories/users-repository.interface';
import { TypeOrmUsersRepository } from '@features/users/repositories/typeorm-users.repository';
import { TokenModule } from '@libs/token/token.module';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: TypeOrmUsersRepository,
    },
  ],
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([User]), TokenModule],
})
export class UsersModule {}
