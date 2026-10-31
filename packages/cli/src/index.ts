#!/usr/bin/env node
import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runSearch, runView } from './commands/search.js';
import { runAdd } from './commands/add.js';
import { runCompose } from './commands/compose.js';
import { runExport } from './commands/export.js';
import { runValidate, runDoctor } from './commands/validate.js';
import { runCreateResource } from './commands/create-resource.js';
import { runLint } from './commands/lint.js';
import { runIngest } from './commands/ingest.js';
import { runGate } from './commands/gate.js';

export * from './config.js';
export * from './commands/init.js';
export * from './commands/search.js';
export * from './commands/add.js';
export * from './commands/compose.js';
export * from './commands/export.js';
export * from './commands/validate.js';
export * from './commands/create-resource.js';
export * from './commands/lint.js';
export * from './commands/ingest.js';
export * from './commands/gate.js';

const program = new Command();

function commandFailed(result: unknown): boolean {
  if (result === null || result === false) return true;
  if (typeof result !== 'object') return false;
  const outcome = result as Record<string, unknown>;
  if (typeof outcome.valid === 'boolean') return !outcome.valid;
  if (typeof outcome.success === 'boolean') return !outcome.success;
  if (typeof outcome.passed === 'boolean') return !outcome.passed;
  if (typeof outcome.overallStatus === 'string') return outcome.overallStatus !== 'approved';
  if (typeof outcome.errorCount === 'number') return outcome.errorCount > 0;
  return false;
}

async function executeCommand(action: () => Promise<unknown>): Promise<void> {
  try {
    const result = await action();
    if (commandFailed(result)) process.exitCode = 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

program
  .name('tess')
  .description('Tessellate CLI — deterministic interface intelligence for humans and agents')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize Tessellate configuration and semantic design tokens')
  .option('-c, --components-dir <dir>', 'Directory to store UI components', 'components/ui')
  .option('-t, --tokens-path <path>', 'Path for semantic tokens stylesheet', 'styles/tokens.css')
  .option('-y, --yes', 'Skip prompts and accept defaults', false)
  .action(async (opts) => {
    await executeCommand(() => runInit(opts));
  });

program
  .command('search [query]')
  .description('Search the Tessellate component catalogue')
  .option('--category <category>', 'Filter by category')
  .action(async (query = '', opts) => {
    await executeCommand(() => runSearch(query, opts));
  });

program
  .command('view <slug>')
  .description('View details of a catalogue resource')
  .action(async (slug) => {
    await executeCommand(() => runView(slug));
  });

program
  .command('add <slug>')
  .description('Download and install a resource from the Tessellate registry')
  .option('-o, --overwrite', 'Overwrite existing files', false)
  .action(async (slug, opts) => {
    await executeCommand(() => runAdd(slug, opts));
  });

program
  .command('compose <prompt>')
  .description('Deterministically compose an interface from a product brief')
  .option('-n, --name <name>', 'Project name', 'Composed Interface')
  .option(
    '-a, --archetype <archetype>',
    'Override product archetype (saas, ecommerce, portfolio, etc.)'
  )
  .option('-o, --output <path>', 'Save ProjectManifest to file')
  .action(async (prompt, opts) => {
    await executeCommand(() => runCompose(prompt, opts));
  });

program
  .command('export [manifest]')
  .description('Export a ProjectManifest into standalone Vite + React + Tailwind source code')
  .option('-o, --output <dir>', 'Output directory', './dist/export')
  .action(async (manifest = 'project.json', opts) => {
    await executeCommand(() => runExport(manifest, opts));
  });

program
  .command('validate <file>')
  .description('Validate a ResourceManifest or ProjectManifest against canonical schemas')
  .action(async (file) => {
    await executeCommand(() => runValidate(file));
  });

program
  .command('lint [path]')
  .description('[Beta] Run heuristic token, spacing, selected contrast/motion, and landmark checks')
  .option(
    '--fix',
    'Apply only small, non-zero spacing adjustments; color findings remain report-only'
  )
  .option('-f, --format <format>', 'Output format: pretty, json, sarif', 'pretty')
  .action(async (targetPath = '.', opts) => {
    await executeCommand(() => runLint(targetPath, opts));
  });

program
  .command('ingest [dir]')
  .description(
    '[Beta] Analyze supported React route and JSX structure; product intent and source mutation are not inferred'
  )
  .option('-o, --output <path>', 'Destination output path for project manifest')
  .option('-n, --name <name>', 'Project name')
  .action(async (dir = '.', opts) => {
    await executeCommand(() => runIngest(dir, opts));
  });

program
  .command('gate [dir]')
  .description(
    '[Beta] Audit a component directory against the current Registry Quality & Security Gate'
  )
  .option('-f, --format <format>', 'Output format: pretty, json, markdown', 'pretty')
  .action(async (dir = '.', opts) => {
    await executeCommand(() => runGate(dir, opts));
  });

program
  .command('doctor')
  .description('Check project environment and Tessellate setup')
  .action(async () => {
    await executeCommand(() => runDoctor());
  });

program
  .command('create-resource')
  .description('[Beta] Create a draft Tessellate resource scaffold for review')
  .option('-s, --slug <slug>', 'Resource slug (e.g. stat-counter-ticker)')
  .option('-n, --name <name>', 'Resource display name')
  .option('-c, --category <category>', 'Category (primitives, blocks, sections)', 'primitives')
  .option('-t, --type <type>', 'Resource type (primitive, block, section, page, flow)', 'primitive')
  .option('-a, --author <author>', 'Author / Creator name')
  .option('-d, --description <desc>', 'Short summary of the resource')
  .action(async (opts) => {
    await executeCommand(() => runCreateResource(opts));
  });

export default program;
