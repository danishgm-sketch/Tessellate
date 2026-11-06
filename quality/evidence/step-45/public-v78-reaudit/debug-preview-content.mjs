import { chromium } from '@playwright/test';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:900}});
page.on('console',m=>{if(m.type()==='error'||m.type()==='warning') console.log('CONSOLE',m.type(),m.text())});
try {
 const url='https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview-content/?resource=button&variant=quiet&theme=light&device=desktop&reducedMotion=false';
 const response=await page.goto(url,{waitUntil:'networkidle'});
 console.log(JSON.stringify({status:response?.status(),title:await page.title(),url:page.url(),text:(await page.locator('body').innerText()).slice(0,1200),frames:page.frames().map(f=>f.url()),html:(await page.locator('body').innerHTML()).slice(0,500)},null,2));
}finally{await browser.close()}
