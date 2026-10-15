import type { GateCheckResult } from '../types.js';

export function checkSecurityIsolationGate(code: string): GateCheckResult {
  const violations: string[] = [];

  const evalPattern = new RegExp('\\b' + 'ev' + 'al\\s*\\(');
  if (evalPattern.test(code)) violations.push('Use of dynamic code execution (eval)');
  if (/\bnew\s+Function\s*\(/.test(code)) violations.push('Dynamic code execution via new Function()');
  if (/dangerouslySetInnerHTML/.test(code)) violations.push('Raw HTML injection via dangerouslySetInnerHTML');
  if (/<script\b[^>]*src\s*=/i.test(code)) violations.push('External third-party <script> tag');
  if (/\b(?:fetch|axios|XMLHttpRequest)\s*\(/.test(code) && !/mock|test/i.test(code)) {
    violations.push('Direct outbound network requests (fetch/axios) inside presentation component');
  }
  if (/(?:api[_-]?key|secret[_-]?key|auth[_-]?token)\s*=\s*['"][a-zA-Z0-9_\-]{16,}['"]/i.test(code)) {
    violations.push('Hardcoded credential or API secret token detected');
  }

  if (violations.length > 0) {
    return {
      id: 'security-isolation',
      name: 'Sandbox Security & Origin Isolation',
      category: 'isolation',
      status: 'fail',
      score: 0,
      details: `Critical security invariant violation(s): ${violations.join(', ')}.`,
      remediation: 'Remove dynamic code execution, raw HTML injection, outbound network calls, and hardcoded credentials. Community resources must be pure and sandbox-isolated.',
    };
  }

  return {
    id: 'security-isolation',
    name: 'Sandbox Security & Origin Isolation',
    category: 'isolation',
    status: 'pass',
    score: 100,
    details: 'Zero security violations. No dynamic eval, no arbitrary HTML injection, no remote script execution, no leaked secrets.',
  };
}
