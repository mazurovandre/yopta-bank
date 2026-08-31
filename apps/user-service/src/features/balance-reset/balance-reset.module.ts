import { Module } from '@nestjs/common';
import { BalanceResetController } from './balance-reset.controller';
import { BalanceResetService } from './balance-reset.service';
import { BullModule } from '@nestjs/bullmq';
import { BALANCE_RESET_QUEUE } from '@features/balance-reset/balance-reset.constants';
import { UsersModule } from '@features/users/users.module';
import { BalanceResetProcessor } from '@features/balance-reset/balance-reset.processor';
import { TokenModule } from '@libs/token/token.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: BALANCE_RESET_QUEUE }),
    UsersModule,
    TokenModule,
  ],
  controllers: [BalanceResetController],
  providers: [BalanceResetService, BalanceResetProcessor],
})
export class BalanceResetModule {}
