export const BALANCE_RESET_QUEUE = 'balance-reset';
export const RESET_ALL_BALANCES_JOB = 'reset-all-balances';
export const BALANCE_RESET_SCHEDULER_ID = 'balance-reset-every-10-minutes';
export const BALANCE_RESET_INTERVAL_MS = 1000 * 60 * 10;
export const BALANCE_RESET_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 } as const,
  removeOnComplete: 100,
  removeOnFail: 500,
};
