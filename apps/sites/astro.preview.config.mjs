import canonical from '../site/astro.config.mjs';
import { fileURLToPath, URL } from 'node:url';

// Preview the canonical Astro output before it is packed into Sites asset payloads.
export default {
  ...canonical,
  outDir: fileURLToPath(new URL('../site/dist/', import.meta.url)),
};
