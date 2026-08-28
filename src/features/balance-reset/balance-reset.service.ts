import { Injectable, Logger } from '@nestjs/common';
import {
  BALANCE_RESET_INTERVAL_MS,
  BALANCE_RESET_JOB_OPTIONS,
  BALANCE_RESET_QUEUE,
  BALANCE_RESET_SCHEDULER_ID,
  RESET_ALL_BALANCES_JOB,
} from '@features/balance-reset/balance-reset.constants';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class BalanceResetService {
  private readonly logger = new Logger(BalanceResetService.name);

  constructor(
    @InjectQueue(BALANCE_RESET_QUEUE) private readonly queue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queue.upsertJobScheduler(
      BALANCE_RESET_SCHEDULER_ID,
      { every: BALANCE_RESET_INTERVAL_MS },
      { name: RESET_ALL_BALANCES_JOB, opts: BALANCE_RESET_JOB_OPTIONS },
    );

    this.logger.log(
      `Scheduler "${BALANCE_RESET_SCHEDULER_ID}" registered, every ${BALANCE_RESET_INTERVAL_MS} ms`,
    );
  }

  async balanceReset(): Promise<string | undefined> {
    const job = await this.queue.add(
      RESET_ALL_BALANCES_JOB,
      {},
      BALANCE_RESET_JOB_OPTIONS,
    );

    this.logger.log(
      `Balance reset job enqueued manually, id=${job.id ?? 'unknown'}`,
    );

    return job.id;
  }
}
