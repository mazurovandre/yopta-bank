import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BALANCE_RESET_QUEUE } from '@features/balance-reset/balance-reset.constants';
import { UsersService } from '@features/users/users.service';
import { Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Processor(BALANCE_RESET_QUEUE)
export class BalanceResetProcessor extends WorkerHost {
  constructor(
    private readonly userService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super();
  }

  async process(): Promise<number> {
    const affected = await this.userService.resetAllBalances();

    await this.cacheManager.clear();

    return affected;
  }
}
