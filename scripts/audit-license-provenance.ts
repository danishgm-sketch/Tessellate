import fs from 'node:fs';
import path from 'node:path';
import { ResourceManifestSchema } from '../packages/schemas/src/resource.js';

function auditLicenseAndProvenance() {
  console.log('--- AUDITING RESOURCE LICENSES, PROVENANCE & QUALITY ---');
  const catalogPath = path.resolve('apps/site/public/data/catalog.json');
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Catalog artifact not found at ${catalogPath}`);
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  const resources = catalog.resources;

  if (!Array.isArray(resources) || resources.length !== 324) {
    throw new Error(`Expected exactly 324 canonical resources, found ${resources?.length}`);
  }

  let invalidLicenses = 0;
  let missingProvenance = 0;
  let subStandardQuality = 0;
  let schemaFailures = 0;

  for (const res of resources) {
    // Validate canonical ResourceManifestSchema
    const parseResult = ResourceManifestSchema.safeParse(res);
    if (!parseResult.success) {
      console.error(`[SCHEMA FAIL] Resource ${res.slug}:`, parseResult.error.issues);
      schemaFailures++;
    }

    // License check: spdx must be an approved open-source license
    if (!res.license || (res.license.spdx !== 'MIT' && res.license.spdx !== 'Apache-2.0')) {
      console.error(`[LICENSE FAIL] Resource ${res.slug} has invalid license:`, res.license);
      invalidLicenses++;
    }

    // Provenance check
    if (!res.provenance || !res.provenance.origin) {
      console.error(`[PROVENANCE FAIL] Resource ${res.slug} is missing provenance origin!`);
      missingProvenance++;
    }

    // Quality check: overall >= 80 unless status is explicitly experimental
    const quality = res.quality?.overall ?? 0;
    if (res.status !== 'experimental' && quality < 80) {
      console.error(`[QUALITY FAIL] Resource ${res.slug} has quality ${quality} < 80 and is not experimental!`);
      subStandardQuality++;
    }
  }

  console.log(`Audited ${resources.length} canonical resources:`);
  console.log(`- Schema failures: ${schemaFailures}`);
  console.log(`- Invalid licenses: ${invalidLicenses}`);
  console.log(`- Missing provenance: ${missingProvenance}`);
  console.log(`- Substandard quality (< 80): ${subStandardQuality}`);

  if (schemaFailures > 0 || invalidLicenses > 0 || missingProvenance > 0 || subStandardQuality > 0) {
    console.error('License and provenance audit failed.');
    process.exit(1);
  }

  console.log('[PASS] All 324 canonical resources pass license, provenance, and quality audits.');
}

auditLicenseAndProvenance();
