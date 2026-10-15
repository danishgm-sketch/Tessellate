export type GateCategory =
  | 'schema'
  | 'token-hygiene'
  | 'accessibility'
  | 'responsive'
  | 'reduced-motion'
  | 'isolation'
  | 'bundle-budget'
  | 'license-provenance';

export type GateStatus = 'pass' | 'fail' | 'warn';

export interface GateCheckResult {
  id: string;
  name: string;
  category: GateCategory;
  status: GateStatus;
  score: number; // 0 - 100
  details: string;
  remediation?: string;
}

export interface RegistryGateReport {
  resourceSlug: string;
  resourceName: string;
  overallStatus: 'approved' | 'rejected' | 'needs-review';
  totalScore: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  checks: GateCheckResult[];
  summary: string;
  markdownReport: string;
}
