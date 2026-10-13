import {test,expect} from '@playwright/test';
test('palette sample action gives truthful preview feedback',async({page})=>{
 await page.goto('/tools/palette/');
 await page.waitForFunction(()=>!document.querySelector('astro-island[ssr][client="load"]'));
 await page.getByRole('button',{name:/Execute Action|Preview action/,exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Example interaction');
});
