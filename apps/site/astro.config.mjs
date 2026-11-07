import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { privateVersoVitePlugin } from './src/integrations/private-verso-vite-plugin.mjs';

// Build-time keyboard access for scrollable canonical documentation code/tables.
function keyboardScrollableContent(){
  return (tree)=>{
    const visit=(node)=>{
      if(node.tagName==='pre'||node.tagName==='table')node.properties={...node.properties,tabIndex:0};
      for(const child of node.children??[])visit(child);
    };
    visit(tree);
  };
}
// Astro 7 accepts a concrete config object. A callback here is parsed as an empty
// config, silently dropping the React renderer and Tailwind Vite plugin.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  integrations: [react()],
  markdown: {processor: unified({rehypePlugins:[keyboardScrollableContent]})},
  vite: {
    build: {cssCodeSplit:false},
    plugins: [tailwindcss(), privateVersoVitePlugin(repositoryRoot, { serveCatalogOverlay: true })],
  },
});
