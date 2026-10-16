import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

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
// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  markdown: {rehypePlugins:[keyboardScrollableContent]},
  vite: {
    build: {cssCodeSplit:false},
    plugins: [tailwindcss()],
  },
});
