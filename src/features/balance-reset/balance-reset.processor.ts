import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { BALANCE_RESET_QUEUE } from '@features/balance-reset/balance-reset.constants';
import { UsersService } from '@features/users/users.service';
import { Inject, Logger } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Job } from 'bullmq';

@Processor(BALANCE_RESET_QUEUE)
export class BalanceResetProcessor extends WorkerHost {
  private readonly logger = new Logger(BalanceResetProcessor.name);

  constructor(
    private readonly userService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super();
  }

  async process(job: Job): Promise<number> {
    this.logger.log(`Job id=${job.id ?? 'unknown'} started`);

    const affected = await this.userService.resetAllBalances();

    await this.cacheManager.clear();

    this.logger.log(
      `Job id=${job.id ?? 'unknown'} finished: ${affected} balance(s) reset, cache cleared`,
    );

    return affected;
  }

  @OnWorkerEvent('completed')
  onComplete(job: Job): void {
    this.logger.log(`Job id=${job?.id ?? 'unknown'} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(
      `Job id=${job?.id ?? 'unknown'} failed: ${error.message}`,
      error.stack,
    );
  }
}
