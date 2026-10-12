import {describe,it,expect,vi} from 'vitest';
import worker from '../apps/sites/worker.js';
describe('Sites security asset routing',()=>{
 it('serves preview HTML through the security worker even when the host bypasses matching public assets',async()=>{
  const fetch=vi.fn(async(request:Request)=>new URL(request.url).pathname==='/__tessellate_asset_payloads/preview/index.html.bin'?new Response('<html>actual preview</html>',{headers:{'Content-Type':'application/octet-stream'}}):new Response('missing',{status:404}));
  const response=await worker.fetch(new Request('https://review.example/preview/'),{ASSETS:{fetch}} as unknown as Parameters<typeof worker.fetch>[1]);
  expect(response.status).toBe(200);expect(await response.text()).toContain('actual preview');expect(response.headers.get('Content-Type')).toContain('text/html');expect(response.headers.get('Content-Security-Policy')).toContain("connect-src 'none'");expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
 });
 it('retains opaque frame module loading and original resource URLs',async()=>{
  let assetPath='';const fetch=vi.fn(async(request:Request)=>{assetPath=new URL(request.url).pathname;return new Response('export default 1',{headers:{'Content-Type':'text/javascript'}});});
  const response=await worker.fetch(new Request('https://review.example/_astro/resource.js'),{ASSETS:{fetch}} as unknown as Parameters<typeof worker.fetch>[1]);
  expect(assetPath).toBe('/__tessellate_asset_payloads/_astro/resource.js');expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');expect(response.headers.get('Content-Type')).toBe('text/javascript');
 });
});
