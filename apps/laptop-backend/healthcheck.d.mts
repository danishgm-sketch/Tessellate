export type HealthcheckStatus =
  | 'healthy'
  | 'starting'
  | 'unhealthy'
  | 'restart-requested'
  | 'restart-signal-failed'
  | 'recovery-budget-exhausted'
  | 'recovery-budget-unavailable';

export interface HealthcheckResult {
  status: HealthcheckStatus;
  consecutiveFailures: number;
  restartCountInWindow?: number;
}

export interface HealthcheckOptions {
  url?: string;
  startedAtPath?: string;
  failuresPath?: string;
  recoveryBudgetPath?: string;
  timeoutMs?: number;
  startupGraceMs?: number;
  failureThreshold?: number;
  restartLimit?: number;
  restartWindowMs?: number;
  now?: () => number;
  fetchImpl?: typeof fetch;
  signalParent?: (signal: NodeJS.Signals) => void;
}

export function runHealthcheck(options?: HealthcheckOptions): Promise<HealthcheckResult>;
