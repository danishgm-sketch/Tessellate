import type { LicenseInfo } from '@tessellate/schemas';

/**
 * Centrally approved SPDX license identifiers permitted for public redistribution.
 * Enforced by the catalogue validator and composition engine hard constraints.
 */
export const APPROVED_SPDX_LICENSES = [
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'CC0-1.0',
  'Unlicense',
  '0BSD',
] as const;

export type ApprovedSpdxLicense = (typeof APPROVED_SPDX_LICENSES)[number];

export function isApprovedLicense(spdx: string): spdx is ApprovedSpdxLicense {
  return (APPROVED_SPDX_LICENSES as readonly string[]).includes(spdx.trim());
}

export interface LicenseValidationResult {
  valid: boolean;
  error?: string;
}

export function validateLicense(license: LicenseInfo): LicenseValidationResult {
  if (!isApprovedLicense(license.spdx)) {
    return {
      valid: false,
      error: `License SPDX '${license.spdx}' is not in the approved allowlist: [${APPROVED_SPDX_LICENSES.join(', ')}]`,
    };
  }

  if (!license.redistributionVerified) {
    return {
      valid: false,
      error: `License '${license.spdx}' must have redistributionVerified set to true.`,
    };
  }

  if (license.attributionRequired && (!license.attributionText || license.attributionText.trim().length === 0)) {
    return {
      valid: false,
      error: `License '${license.spdx}' specifies attributionRequired=true but is missing attributionText.`,
    };
  }

  return { valid: true };
}
