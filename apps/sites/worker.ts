/** Sites-specific response adapter. Assets are the canonical Astro production build. */
export default {
 async fetch(request:Request,env:Env):Promise<Response> {
  const response=await env.ASSETS.fetch(request);
  const url=new URL(request.url);
  const headers=new Headers(response.headers);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('X-Frame-Options','SAMEORIGIN');
  headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=()');
  const preview=url.pathname==='/preview' || url.pathname.startsWith('/preview/');
  const origin=url.origin;
  const common="object-src 'none'; base-uri 'self'; frame-ancestors 'self';";
  headers.set('Content-Security-Policy',preview
   ? `default-src 'none'; script-src ${origin} 'unsafe-inline'; style-src ${origin} 'unsafe-inline'; img-src ${origin} data:; font-src ${origin} data:; connect-src 'none'; frame-src 'none'; ${common}`
   : `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.tessellate.design http://localhost:8787 https://api.github.com; frame-src 'self' https://preview.tessellate.design http://localhost:4321 http://localhost:5173; ${common}`);
  // Opaque sandbox frames can load only public compiled assets. No credentials or APIs are exposed.
  if(url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/src/styles/')) headers.set('Access-Control-Allow-Origin','*');
  if(url.pathname.startsWith('/_astro/'))headers.set('Cache-Control','public, max-age=31536000, immutable');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }
};
