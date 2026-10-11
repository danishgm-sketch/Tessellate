#!/usr/bin/env node
import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runSearch, runView } from './commands/search.js';
import { runAdd } from './commands/add.js';
import { runCompose } from './commands/compose.js';
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
  .action(async (slug, opts) => {
    await runAdd(slug, opts);
  });

program
  .command('compose <prompt>')
  .description('Deterministically compose an interface from a product brief')
  .option('-n, --name <name>', 'Project name', 'Composed Interface')
  .option('-a, --archetype <archetype>', 'Override product archetype (saas, ecommerce, portfolio, etc.)')
  .option('-o, --output <path>', 'Save ProjectManifest to file')
  .action(async (prompt, opts) => {
    await runCompose(prompt, opts);
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

