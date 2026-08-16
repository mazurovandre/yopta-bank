import { Injectable } from '@nestjs/common';
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
  constructor(
    @InjectQueue(BALANCE_RESET_QUEUE) private readonly queue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queue.upsertJobScheduler(
      BALANCE_RESET_SCHEDULER_ID,
      { every: BALANCE_RESET_INTERVAL_MS },
      { name: RESET_ALL_BALANCES_JOB, opts: BALANCE_RESET_JOB_OPTIONS },
    );
  }

  async balanceReset(): Promise<string | undefined> {
    const job = await this.queue.add(
      RESET_ALL_BALANCES_JOB,
      {},
      BALANCE_RESET_JOB_OPTIONS,
    );

    return job.id;
  }
}
