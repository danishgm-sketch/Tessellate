import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for(const slug of ['accessibility-commitment-section','ai-approval-request'])test(`${slug} actual preview has readable contrast`,async({page})=>{
 await page.goto(`/preview/?resource=${slug}`);
 await expect(page.locator(`[data-node-id="preview-${slug}"]`)).toBeAttached();
 await page.waitForLoadState('networkidle');
 const result=await new AxeBuilder({page}).options({preload:false}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(result.violations).toEqual([]);
});
