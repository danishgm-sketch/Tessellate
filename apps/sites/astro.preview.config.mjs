import canonical from '../site/astro.config.mjs';
import { fileURLToPath, URL } from 'node:url';

// Use Astro's directory-page routing to review the packaged static artifact.
export default { ...canonical, outDir: fileURLToPath(new URL('../../dist/', import.meta.url)) };
