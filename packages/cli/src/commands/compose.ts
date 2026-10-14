import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { BriefInterpretationSchema, ProjectManifestSchema, SUGGESTED_ENTITY_CONFIDENCE, type BriefInterpretation, type ProjectManifest } from '@tessellate/schemas';
import { composeFromInterpretation } from '@tessellate/compatibility';
import { requestInterpretation, type QueueClientOptions } from '@tessellate/intelligence';
import { getCatalogue } from './search.js';

/** API used for brief interpretation (D-033). Override with --api or TESSELLATE_API_URL. */
export const DEFAULT_API_URL = 'https://tessellate.design';

export interface InterpretOptions {
  output?: string;
  cwd?: string;
  api?: string;
  /** Test seam: replaces the network client. */
  queue?: QueueClientOptions;
}

export interface ComposeOptions extends InterpretOptions {
  name?: string;
  /** Path to a reviewed interpretation JSON (from `tess interpret`); skips the intelligence service. */
  from?: string;
  /** Which of the three directions to write: a (conservative), b (expressive) or c (structural). */
  direction?: 'a' | 'b' | 'c';
}

function apiBase(options: InterpretOptions): string {
  return (options.api ?? process.env.TESSELLATE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
}

function writeJson(file: string, cwd: string | undefined, value: unknown): string {
  const outPath = path.resolve(cwd || process.cwd(), file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(value, null, 2) + '\n', 'utf-8');
  return outPath;
}

function describe(interp: BriefInterpretation): void {
  const pm = interp.productModel;
  console.log(`  • Product type: ${pm.productArchetypes[0]?.tag ?? 'unknown'} (confidence ${interp.confidence.archetype.toFixed(2)})`);
  const entities = Object.entries(interp.confidence.entities);
  const mentioned = entities.filter(([, c]) => c > SUGGESTED_ENTITY_CONFIDENCE).map(([n]) => n);
  const suggested = entities.filter(([, c]) => c <= SUGGESTED_ENTITY_CONFIDENCE).map(([n]) => n);
  console.log(`  • Entities from your brief: ${mentioned.join(', ') || 'none'}`);
  if (suggested.length) console.log(`  • Suggested (not in your brief): ${suggested.join(', ')}`);
  const screens = interp.screenGraph.groups.reduce((n, g) => n + g.screens.length, 0);
  console.log(`  • Planned screens: ${screens}`);
  for (const a of interp.assumptions) console.log(`  • Assumed: ${a}`);
}

/**
 * Sends a brief to the Tessellate intelligence service and returns the interpretation for review.
 * There is no offline fallback (D-033): if the service is unavailable this fails with the reason.
 */
export async function runInterpret(promptText: string, options: InterpretOptions = {}): Promise<BriefInterpretation> {
  console.log(`[tess] Interpreting brief…`);
  const result = await requestInterpretation(
    promptText,
    (p) => {
      if (p.status === 'queued' || p.status === 'offline') console.log(`  … ${p.message}`);
    },
    { apiBase: apiBase(options), ...options.queue },
  );
  if (!result.success || !result.interpretation) {
    throw new Error(result.error ?? 'Tessellate could not interpret this brief.');
  }
  describe(result.interpretation);
  if (options.output) {
    const out = writeJson(options.output, options.cwd, result.interpretation);
    console.log(`[tess] Interpretation saved to ${out}. Review and edit it, then run: tess compose --from ${options.output}`);
  }
  return result.interpretation;
}

/** Composes a project from a brief (via the intelligence service) or from a reviewed interpretation file. */
export async function runCompose(promptText: string | undefined, options: ComposeOptions = {}): Promise<ProjectManifest> {
  let interpretation: BriefInterpretation;
  if (options.from) {
    const file = path.resolve(options.cwd || process.cwd(), options.from);
    const parsed = BriefInterpretationSchema.safeParse(JSON.parse(fs.readFileSync(file, 'utf-8')));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(`${options.from} is not a valid interpretation: ${issue?.path.join('.') || '(root)'} ${issue?.message ?? ''}`.trim());
    }
    interpretation = parsed.data;
  } else {
    if (!promptText) throw new Error('Give a product brief, or --from <interpretation.json>.');
    interpretation = await runInterpret(promptText, { ...options, output: undefined });
  }

  const catalogue = await getCatalogue(options.cwd);
  if (catalogue.resources.length === 0) {
    throw new Error('The resource catalogue could not be loaded, so nothing can be composed. Check your connection or registry setting.');
  }
  const composition = composeFromInterpretation(interpretation, {
    catalogResources: catalogue.resources,
    projectIdBase: `proj_${randomUUID()}`,
    productName: options.name,
  });
  const gaps = { a: composition.directionA, b: composition.directionB, c: composition.directionC }[options.direction ?? 'a'].diagnostics ?? [];
  if (gaps.length) console.log(`  • ${gaps.length} section(s) have no library resource yet (gaps): ${[...new Set(gaps.map((g) => g.label ?? g.role))].join(', ')}`);
  const pick = { a: composition.directionA, b: composition.directionB, c: composition.directionC }[options.direction ?? 'a'];
  const manifest = ProjectManifestSchema.parse({
    ...pick.manifest,
    description: promptText ?? pick.manifest.description,
  });
  console.log(`[tess] Composed "${manifest.name}" (${pick.direction.name}) with ${manifest.screens.length} screens.`);

  if (options.output) {
    console.log(`[tess] Saved ProjectManifest to ${writeJson(options.output, options.cwd, manifest)}`);
  }
  return manifest;
}
