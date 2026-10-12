import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('homepage contract example is truthful and uses readable dark tokens',async({page})=>{
 await page.goto('/');const example=page.getByLabel('AGENT_HANDOFF JSON specification');await example.scrollIntoViewIfNeeded();
 await expect(example.locator('..')).toContainText('ILLUSTRATIVE EXCERPT');await expect(example).not.toContainText('fintech-telemetry');
});
test('dark agent example has sufficient contrast',async({page})=>{
 await page.goto('/');await page.getByLabel('AGENT_HANDOFF JSON specification').scrollIntoViewIfNeeded();
 const axe=await new AxeBuilder({page}).options({preload:false}).include('pre[aria-label="AGENT_HANDOFF JSON specification"] + div').analyze();expect(axe.violations).toEqual([]);
});
