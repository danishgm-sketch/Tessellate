import {it,expect} from 'vitest';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {exec,spawn} from 'node:child_process';
import {promisify} from 'node:util';
import {chromium} from '@playwright/test';
import {composeProjectPipeline} from '../packages/compatibility/src/compose-pipeline.js';
import {generateSourceTree} from '../packages/exporter/src/source-tree.js';
const run = promisify(exec);

it('standalone employee product preserves nested records and CTA content in a real independent runtime',async()=>{
  const resources=JSON.parse(readFileSync('apps/site/public/data/catalog.json','utf8')).resources;
  const manifest=composeProjectPipeline({description:'Employee experience platform with people, teams, onboarding and policies',feel:'professional but playful'}, {catalogResources:resources,seed:'export-employee'}).directionC.manifest;
  const files=generateSourceTree(manifest);
  const directory=mkdtempSync(path.join(os.tmpdir(),'tessellate-employee-export-'));
  for(const [name,content] of Object.entries(files)){const filename=path.join(directory,name);mkdirSync(path.dirname(filename),{recursive:true});writeFileSync(filename,content);}
  await run('npm install --no-audit --no-fund',{cwd:directory,timeout:240000});
  await run('npm run build',{cwd:directory,timeout:240000});
  const port=18367;
  const server=spawn(process.execPath,[path.join(directory,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:directory,stdio:'pipe'});
  let previewOutput='';
  const ready=new Promise<void>((resolve,reject)=>{
    const finish=(error?:Error)=>{clearTimeout(timer);clearInterval(probe);if(error)reject(error);else resolve();};
    const timer=setTimeout(()=>finish(new Error(`Export preview did not become ready: ${previewOutput}`)),20000);
    const probe=setInterval(()=>{void fetch(`http://127.0.0.1:${port}`,{signal:AbortSignal.timeout(1000)}).then(response=>{if(response.ok)finish();}).catch(()=>{});},200);
    server.stdout.on('data',data=>{previewOutput+=String(data);});
    server.stderr.on('data',data=>{previewOutput+=String(data);});
    server.on('error',error=>finish(error));
    server.on('exit',code=>finish(new Error(`Export preview exited ${code}: ${previewOutput}`)));
  });
  const browser=await chromium.launch();
  try {
    await ready;
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}`);
    expect(await page.getByRole('link',{name:'Meet your team',exact:true}).count()).toBe(1);
    await page.getByRole('button',{name:'People Directory',exact:true}).click();
    await page.getByText('Example colleague A',{exact:true}).waitFor();
    expect(await page.getByText('Product team',{exact:true}).count()).toBeGreaterThan(0);
    expect(errors).toEqual([]);
    expect(JSON.stringify(JSON.parse(files['package.json']!).dependencies)).not.toContain('@tessellate/');
  } finally {await browser.close();server.kill();}
},300000);
