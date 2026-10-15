import type { ResourceManifest } from '@tessellate/schemas';
import type { GateCheckResult } from '../types.js';

const APPROVED_LICENSES = ['MIT', 'Apache-2.0', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'CC0-1.0'];

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

  const licRaw = manifest.license as any;
  const lic = (typeof licRaw === 'string' ? licRaw : licRaw?.spdx || licRaw?.name || '').trim();
  const author = ((manifest.creator as any)?.displayName || (manifest.creator as any)?.name || '').trim();
  const provenanceRaw = manifest.provenance as any;
  const provenance = typeof provenanceRaw === 'string' ? provenanceRaw : provenanceRaw?.origin || '';

  const isApprovedLic = APPROVED_LICENSES.includes(lic);

  if (!isApprovedLic) {
    return {
      id: 'license-provenance',
      name: 'Open Source License & Provenance',
      category: 'license-provenance',
      status: 'fail',
      score: 20,
      details: `License "${lic}" is not in the approved open source license list (${APPROVED_LICENSES.join(', ')}).`,
      remediation: 'Community resources must declare an approved OSI-compatible open license (e.g. MIT, Apache-2.0).',
    };
  }

  if (!author) {
    return {
      id: 'license-provenance',
      name: 'Open Source License & Provenance',
      category: 'license-provenance',
      status: 'warn',
      score: 80,
      details: 'Creator / author name is not declared.',
      remediation: 'Specify creator.name in manifest.json to credit the original author.',
    };
  }

  return {
    id: 'license-provenance',
    name: 'Open Source License & Provenance',
    category: 'license-provenance',
    status: 'pass',
    score: 100,
    details: `Approved license (${lic}) and author provenance (${author}${provenance ? `, ${provenance}` : ''}) verified.`,
  };
}
