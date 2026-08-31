import { BalanceResetService } from '@features/balance-reset/balance-reset.service';
import { Job, Queue } from 'bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq/dist/utils/get-queue-token.util';
import {
  BALANCE_RESET_INTERVAL_MS,
  BALANCE_RESET_JOB_OPTIONS,
  BALANCE_RESET_QUEUE,
  BALANCE_RESET_SCHEDULER_ID,
  RESET_ALL_BALANCES_JOB,
} from '@features/balance-reset/balance-reset.constants';

describe('BalanceResetService', () => {
  let balanceResetService: BalanceResetService;
  let queue: jest.Mocked<Pick<Queue, 'add' | 'upsertJobScheduler'>>;
  let module: TestingModule;

  beforeEach(async () => {
    queue = {
      add: jest.fn(),
      upsertJobScheduler: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        BalanceResetService,
        { provide: getQueueToken(BALANCE_RESET_QUEUE), useValue: queue },
      ],
    }).compile();

    balanceResetService = module.get(BalanceResetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduling', () => {
    it('registers the repeatable job', async () => {
      await module.init();

      expect(queue.upsertJobScheduler).toHaveBeenCalledWith(
        BALANCE_RESET_SCHEDULER_ID,
        { every: BALANCE_RESET_INTERVAL_MS },
        { name: RESET_ALL_BALANCES_JOB, opts: BALANCE_RESET_JOB_OPTIONS },
      );
    });
  });

  describe('balanceReset', () => {
    it('enqueues a job', async () => {
      queue.add.mockResolvedValue({ id: '42' } as Job);

      const jobId = await balanceResetService.balanceReset();

      expect(queue.add).toHaveBeenCalledWith(
        RESET_ALL_BALANCES_JOB,
        {},
        BALANCE_RESET_JOB_OPTIONS,
      );
      expect(jobId).toBe('42');
    });
  });
});
