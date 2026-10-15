/** Writes packages/renderer/src/tokens/resource-theme.css from the RESOURCE_THEME_CSS constant (Phase 30). */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { RESOURCE_THEME_CSS } from '../packages/renderer/src/tokens/resource-theme.js';

const out = path.resolve('packages/renderer/src/tokens/resource-theme.css');
fs.writeFileSync(out, RESOURCE_THEME_CSS, 'utf-8');
console.log(`[theme] wrote ${path.relative(process.cwd(), out)}`);
