import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { USERS_REPOSITORY } from '@features/users/repositories/users-repository.interface';
import { TypeOrmUsersRepository } from '@features/users/repositories/typeorm-users.repository';
import { TokenModule } from '@libs/token/token.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TRANSACTION_KAFKA } from '@common/constants/transactions.constants';
import { ConfigService } from '@nestjs/config';

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
  imports: [
    TypeOrmModule.forFeature([User]),
    TokenModule,
    ClientsModule.registerAsync([
      {
        name: TRANSACTION_KAFKA,
        useFactory: (configService: ConfigService) => {
          const host = configService.get<string>('kafka.host');
          const port = configService.get<number>('kafka.port');

          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'notification',
                brokers: [`${host}:${port}`],
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class UsersModule {}
