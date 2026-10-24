/** Sites-specific response adapter. Assets are the canonical Astro production build. */
import { proxyBackend } from './backend.js';
import {
 PREVIEW_INLINE_SCRIPT_HASHES,
 PREVIEW_INLINE_STYLE_HASHES,
 SITE_INLINE_SCRIPT_HASHES,
 SITE_INLINE_STYLE_HASHES,
} from './src/generated-preview-csp.js';
export default {
 async fetch(request:Request,env:Env):Promise<Response> {
  const url=new URL(request.url);
  if (url.pathname.startsWith('/api/')) return proxyBackend(request, { url: env.TESSELLATE_BACKEND_URL, secret: env.TESSELLATE_GATEWAY_SECRET });
  const previewContent=url.pathname==='/preview-content' || url.pathname.startsWith('/preview-content/');
  if(previewContent && request.headers.get('Sec-Fetch-Dest')==='document') {
   return Response.redirect(`${url.origin}/preview/${url.search}`,302);
  }
  const prefix='/__tessellate_asset_payloads';
  const html=!/\.[a-z\d]+$/i.test(url.pathname) || url.pathname.endsWith('.html');
  const assetUrl=new URL(url);
  assetUrl.pathname=prefix+(html ? (url.pathname.endsWith('.html') ? url.pathname : url.pathname.replace(/\/?$/,'/')+'index.html')+'.bin' : url.pathname);
  let response=await env.ASSETS.fetch(new Request(assetUrl,request));
  if(response.status===404 && html){
   assetUrl.pathname=prefix+'/404.html.bin';
   const fallback=await env.ASSETS.fetch(new Request(assetUrl,request));
   if(fallback.ok)response=new Response(fallback.body,{status:404,headers:fallback.headers});
  }
  const headers=new Headers(response.headers);
  if(html){
   headers.set('Content-Type','text/html; charset=utf-8');
   // Preserve the exact vetted HTML and opaque preview CSP at the hosting edge.
   headers.set('Cache-Control', 'no-transform');
  }
  headers.set('X-Content-Type-Options','nosniff');
  if(previewContent)headers.delete('X-Frame-Options');
  else headers.set('X-Frame-Options','SAMEORIGIN');
  headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=()');
  const previewWrapper=url.pathname==='/preview' || url.pathname.startsWith('/preview/');
  const origin=url.origin;
  const common="object-src 'none'; base-uri 'self';";
  const inlineScriptHashes=PREVIEW_INLINE_SCRIPT_HASHES.join(' ');
  const inlineStyleHashes=PREVIEW_INLINE_STYLE_HASHES.join(' ');
  const siteScriptSources=["'self'",...SITE_INLINE_SCRIPT_HASHES].join(' ');
  const siteStyleSources=["'self'",...SITE_INLINE_STYLE_HASHES].join(' ');
  headers.set('Content-Security-Policy',previewContent
   ? `default-src 'none'; form-action 'none'; script-src ${origin}/_astro/ ${inlineScriptHashes}; style-src ${origin}/_astro/ ${inlineStyleHashes}; style-src-elem ${origin}/_astro/ ${inlineStyleHashes}; style-src-attr 'unsafe-inline'; img-src ${origin} data:; font-src ${origin} data:; connect-src ${origin}/_astro/; frame-src 'none'; sandbox allow-scripts; ${common}`
   : previewWrapper
    ? `default-src 'none'; form-action 'none'; script-src ${origin}/_astro/; style-src ${origin}/_astro/; style-src-elem ${origin}/_astro/; style-src-attr 'unsafe-inline'; img-src ${origin} data:; font-src ${origin} data:; connect-src 'none'; frame-src ${origin}; sandbox allow-scripts; frame-ancestors 'self'; ${common}`
   : `default-src 'self'; form-action 'self'; script-src ${siteScriptSources}; style-src ${siteStyleSources}; style-src-elem ${siteStyleSources}; style-src-attr 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.tessellate.design http://localhost:8787 https://api.github.com; frame-src 'self' https://preview.tessellate.design http://localhost:4321 http://localhost:5173; frame-ancestors 'self'; ${common}`);
  // Opaque sandbox frames can load only public compiled assets. No credentials or APIs are exposed.
  if(url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/src/styles/')) headers.set('Access-Control-Allow-Origin','*');
  if(url.pathname.startsWith('/_astro/'))headers.set('Cache-Control','public, max-age=31536000, immutable');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }
};
