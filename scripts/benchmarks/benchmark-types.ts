export interface ClientScenario {
  id: string;
  index: number;
  domain: string;
  archetypeExpected?: string;
  title: string;
  description: string;
  feel?: string;
  visualAmbition?: number;
  structuralCreativity?: number;
  accessibilityFloor?: 'A' | 'AA' | 'AAA';
  performanceCeiling?: 'lightweight' | 'balanced' | 'rich';
  targetDevices?: Array<'desktop' | 'tablet' | 'mobile'>;
  requiredScreens?: string[];
  forbiddenScreens?: string[];
}

export interface ScenarioBenchmarkResult {
  scenarioId: string;
  index: number;
  domain: string;
  title: string;
  passed: boolean;
  score: number; // 0 - 100
  durationMs: number;
  detectedArchetype: string;
  screenCount: number;
  unresolvedRolesCount: number;
  unresolvedRoles: string[];
  schemaErrors: string[];
  exportErrors: string[];
  dnaViolations: string[];
  directionResults: {
    directionA: { valid: boolean; screenCount: number; diagnosticsCount: number };
    directionB: { valid: boolean; screenCount: number; diagnosticsCount: number };
    directionC: { valid: boolean; screenCount: number; diagnosticsCount: number };
  };
  details: string;
}

export interface BenchmarkAggregateSummary {
  timestamp: string;
  totalScenarios: number;
  passedCount: number;
  failedCount: number;
  passRatePercent: number;
  averageScore: number;
  averageDurationMs: number;
  totalDurationMs: number;
  unresolvedRoleFrequencies: Record<string, number>;
  domainFailureBreakdown: Record<string, { total: number; failed: number; failRate: number }>;
  archetypeFailureBreakdown: Record<string, { total: number; failed: number; failRate: number }>;
  failureCategories: {
    schemaErrors: number;
    unresolvedRoles: number;
    exportFailures: number;
    dnaViolations: number;
    screenGraphDefects: number;
  };
}
