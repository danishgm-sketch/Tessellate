import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {sites} from './build/sites-vite-plugin.js';
import {cloudflare} from '@cloudflare/vite-plugin';
export default defineConfig({
 root:fileURLToPath(new URL('../../',import.meta.url)),
 publicDir:fileURLToPath(new URL('./.static',import.meta.url)),
 plugins:[sites({mockAuth:false}),cloudflare({viteEnvironment:{name:'server'},configPath:fileURLToPath(new URL('./wrangler.jsonc',import.meta.url)),inspectorPort:false})],
});
