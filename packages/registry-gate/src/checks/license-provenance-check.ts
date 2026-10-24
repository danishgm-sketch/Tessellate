import type { ResourceManifest } from '@tessellate/schemas';
import type { GateCheckResult } from '../types.js';

const LICENSE_NAMES: Record<string, readonly string[]> = {
  MIT: ['mit', 'mit license'],
  'Apache-2.0': ['apache 2 0', 'apache license 2 0'],
  ISC: ['isc', 'isc license'],
  'BSD-2-Clause': ['bsd 2 clause', 'bsd 2 clause license', 'bsd 2 clause simplified license'],
  'BSD-3-Clause': ['bsd 3 clause', 'bsd 3 clause license', 'bsd 3 clause new or revised license'],
  'CC0-1.0': ['cc0 1 0', 'cc0 1 0 universal', 'creative commons zero v1 0 universal'],
};

function normalizedLicenseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function failure(details: string): GateCheckResult {
  return {
    id: 'license-provenance',
    name: 'Open Source License & Provenance',
    category: 'license-provenance',
    status: 'fail',
    score: 0,
    details,
    remediation:
      'Use an approved SPDX license with a matching display name, verified redistribution rights, and complete attribution/source details.',
  };
}

export function checkLicenseProvenanceGate(manifest?: ResourceManifest): GateCheckResult {
  if (!manifest) {
    return {
      id: 'license-provenance',
      name: 'Open Source License & Provenance',
      category: 'license-provenance',
      status: 'fail',
      score: 0,
      details: 'No manifest available to evaluate license and provenance.',
      remediation: 'Provide manifest.json with author and license fields.',
    };
  }

  const license = manifest.license;
  const provenance = manifest.provenance;
  if (
    provenance.origin === 'unknown' ||
    provenance.derivative === 'unknown' ||
    provenance.aiAssistance === 'unknown'
  ) {
    return failure('Provenance origin, derivation, and AI assistance must be reviewed before registry submission.');
  }
  const approvedNames = LICENSE_NAMES[license.spdx];
  if (!approvedNames) {
    return failure(
      `License SPDX identifier "${license.spdx}" is not in the approved open-source list (${Object.keys(LICENSE_NAMES).join(', ')}).`
    );
  }
  if (!approvedNames.includes(normalizedLicenseName(license.name))) {
    return failure(
      `License name "${license.name}" does not match SPDX identifier "${license.spdx}".`
    );
  }
  if (!license.redistributionVerified) {
    return failure(`Redistribution rights for "${license.spdx}" are not marked verified.`);
  }
  if (license.attributionRequired && !license.attributionText?.trim()) {
    return failure(`License "${license.spdx}" requires attribution text, but none is provided.`);
  }
  const hasOriginalLocator = Boolean(
    provenance.originalUrl?.trim() || provenance.originalRepository?.trim()
  );
  if (provenance.derivative && (!provenance.derivativeNotes?.trim() || !hasOriginalLocator)) {
    return failure(
      'Derivative work must identify its original source and describe the changes made.'
    );
  }
  if (provenance.origin === 'open-source' && !hasOriginalLocator) {
    return failure('Open-source provenance must identify its original URL or repository.');
  }

  const author = manifest.creator.displayName.trim();
  if (!manifest.creator.id.trim() || !manifest.creator.handle.trim() || !author) {
    return failure('Creator identity fields must contain non-empty values.');
  }

  return {
    id: 'license-provenance',
    name: 'Open Source License & Provenance',
    category: 'license-provenance',
    status: 'pass',
    score: 100,
    details: `License metadata is internally consistent (${license.spdx}); redistribution is marked verified; creator ${author} and origin ${provenance.origin} are declared.`,
  };
}
