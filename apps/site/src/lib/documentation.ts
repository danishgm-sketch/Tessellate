import type {MarkdownInstance} from 'astro';
export const documentation=Object.entries(import.meta.glob<MarkdownInstance<Record<string,unknown>>>('../../../../../docs/*.md',{eager:true})).map(([path,document])=>({slug:path.split('/').pop()!.replace('.md','').toLowerCase().replaceAll('_','-'),title:path.split('/').pop()!.replace('.md','').replaceAll('_',' '),Content:document.Content}));
