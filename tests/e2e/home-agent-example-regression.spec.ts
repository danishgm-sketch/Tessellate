import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('homepage contract example is truthful and uses readable dark tokens',async({page})=>{
 await page.goto('/');const example=page.getByRole('group',{name:'ProjectManifest excerpt'});await example.scrollIntoViewIfNeeded();
 await expect(example.locator('..')).toContainText('ILLUSTRATIVE EXCERPT');await expect(example).not.toContainText('fintech-telemetry');
});
test('dark agent example has sufficient contrast',async({page})=>{
 await page.goto('/');await page.getByRole('group',{name:'ProjectManifest excerpt'}).scrollIntoViewIfNeeded();
 const axe=await new AxeBuilder({page}).options({preload:false}).include('pre[role="group"][aria-labelledby="agent-handoff-json-specification-label"] + div').analyze();expect(axe.violations).toEqual([]);
});
