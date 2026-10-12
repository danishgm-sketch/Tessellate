import {it,expect} from 'vitest';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execSync,spawn} from 'node:child_process';
import {chromium} from '@playwright/test';
import {composeProjectPipeline} from '../packages/compatibility/src/compose-pipeline.js';
import {generateSourceTree} from '../packages/exporter/src/source-tree.js';

it('standalone employee product preserves nested records and CTA content in a real independent runtime',async()=>{
  const resources=JSON.parse(readFileSync('apps/site/public/data/catalog.json','utf8')).resources;
  const manifest=composeProjectPipeline({description:'Employee experience platform with people, teams, onboarding and policies',feel:'professional but playful'}, {catalogResources:resources,seed:'export-employee'}).directionC.manifest;
  const files=generateSourceTree(manifest);
  const directory=mkdtempSync(path.join(os.tmpdir(),'tessellate-employee-export-'));
  for(const [name,content] of Object.entries(files)){const filename=path.join(directory,name);mkdirSync(path.dirname(filename),{recursive:true});writeFileSync(filename,content);}
  execSync('npm install --no-audit --no-fund',{cwd:directory,stdio:'pipe',timeout:90000});
  execSync('npm run build',{cwd:directory,stdio:'pipe',timeout:90000});
  const port=18367;
  const server=spawn(process.execPath,[path.join(directory,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:directory,stdio:'pipe'});
  const browser=await chromium.launch();
  try {
    await new Promise<void>((resolve,reject)=>{server.stdout.on('data',data=>{if(String(data).includes('Local:'))resolve();});server.on('error',reject);server.on('exit',code=>reject(new Error(`Export preview exited ${code}`)));});
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
},180000);
