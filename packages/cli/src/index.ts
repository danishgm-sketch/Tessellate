#!/usr/bin/env node
import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runSearch, runView } from './commands/search.js';
import { runAdd } from './commands/add.js';
import { runCompose, runInterpret } from './commands/compose.js';
import { runExport } from './commands/export.js';
import { runValidate, runDoctor } from './commands/validate.js';
import { runCreateResource } from './commands/create-resource.js';

export * from './config.js';
export * from './commands/init.js';
export * from './commands/search.js';
export * from './commands/add.js';
export * from './commands/compose.js';
export * from './commands/export.js';
export * from './commands/validate.js';
export * from './commands/create-resource.js';

const program = new Command();

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
    await runInit(opts);
  });

program
  .command('search [query]')
  .description('Search the Tessellate component catalogue')
  .option('--category <category>', 'Filter by category')
  .action(async (query = '', opts) => {
    await runSearch(query, opts);
  });

program
  .command('view <slug>')
  .description('View details of a catalogue resource')
  .action(async (slug) => {
    await runView(slug);
  });

program
  .command('add <slug>')
  .description('Download and install a resource from the Tessellate registry')
  .option('-o, --overwrite', 'Overwrite existing files', false)
  .option('-r, --registry <url>', 'Registry base URL (overrides tessellate.json)')
  .option('--dry-run', 'Show what would be installed without writing files', false)
  .action(async (slug, opts) => {
    const result = await runAdd(slug, opts);
    if (!result.success) process.exitCode = 1;
  });

program
  .command('interpret <brief>')
  .description('Ask the Tessellate intelligence service what your product needs (for review before composing)')
  .option('-o, --output <path>', 'Save the interpretation JSON for review', 'interpretation.json')
  .option('--api <url>', 'Tessellate API URL (default https://tessellate.design or TESSELLATE_API_URL)')
  .action(async (brief, opts) => {
    try {
      await runInterpret(brief, opts);
    } catch (err) {
      console.error(`[tess] ${(err as Error).message}`);
      process.exitCode = 1;
    }
  });

program
  .command('compose [brief]')
  .description('Compose a project from a brief, or from a reviewed interpretation with --from')
  .option('-n, --name <name>', 'Project name')
  .option('-f, --from <path>', 'Reviewed interpretation JSON from `tess interpret` (no network needed)')
  .option('-d, --direction <a|b|c>', 'Direction to keep: a conservative, b expressive, c structural', 'a')
  .option('-o, --output <path>', 'Save ProjectManifest to file', 'project.json')
  .option('--api <url>', 'Tessellate API URL (default https://tessellate.design or TESSELLATE_API_URL)')
  .action(async (brief, opts) => {
    try {
      await runCompose(brief, opts);
    } catch (err) {
      console.error(`[tess] ${(err as Error).message}`);
      process.exitCode = 1;
    }
  });

program
  .command('export [manifest]')
  .description('Export a ProjectManifest into standalone Vite + React + Tailwind source code')
  .option('-o, --output <dir>', 'Output directory', './dist/export')
  .action(async (manifest = 'project.json', opts) => {
    await runExport(manifest, opts);
  });

program
  .command('validate <file>')
  .description('Validate a ResourceManifest or ProjectManifest against canonical schemas')
  .action(async (file) => {
    await runValidate(file);
  });

program
  .command('doctor')
  .description('Check project environment and Tessellate setup')
  .action(async () => {
    await runDoctor();
  });

program
  .command('create-resource')
  .description('Scaffold a new validated Tessellate resource (Contribution Wizard)')
  .option('-s, --slug <slug>', 'Resource slug (e.g. stat-counter-ticker)')
  .option('-n, --name <name>', 'Resource display name')
  .option('-c, --category <category>', 'Category (primitives, blocks, sections)', 'primitives')
  .option('-t, --type <type>', 'Resource type (primitive, block, section, page, flow)', 'primitive')
  .option('-a, --author <author>', 'Author / Creator name')
  .option('-d, --description <desc>', 'Short summary of the resource')
  .action(async (opts) => {
    await runCreateResource(opts);
  });

import { pathToFileURL } from 'node:url';

// Execute when run as CLI
if (
  process.argv[1] &&
  (pathToFileURL(process.argv[1]).href.toLowerCase() === import.meta.url.toLowerCase() ||
    import.meta.url.toLowerCase().endsWith(process.argv[1].replace(/\\/g, '/').toLowerCase()))
) {
  program.parse();
}

export default program;

