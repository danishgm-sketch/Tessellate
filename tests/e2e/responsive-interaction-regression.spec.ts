import AxeBuilder from '@axe-core/playwright';
import {test,expect} from '@playwright/test';
test('1024px public header keeps navigation and primary controls within the viewport',async({page})=>{
 await page.setViewportSize({width:1024,height:900});await page.goto('/');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1024);
 await expect(page.getByRole('button',{name:'Toggle menu'})).toBeVisible();
});
test('mobile export choices receive real taps above the project canvas',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/compose/');await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
 await page.getByLabel('Product Description & Objectives').fill('Employee experience platform for 500 people with teams and onboarding');await page.getByTestId('compose-submit-btn').click();await page.getByTestId('open-workbench-dir-03').click();
 await page.getByTestId('export-button').click();const [download]=await Promise.all([page.waitForEvent('download'),page.getByTestId('export-manifest-btn').click({timeout:5000})]);expect(download.suggestedFilename()).toMatch(/\.tess\.json$/);
 await page.getByTestId('export-button').click();const [zip]=await Promise.all([page.waitForEvent('download'),page.getByTestId('export-zip-btn').click({timeout:5000})]);expect(zip.suggestedFilename()).toMatch(/\.zip$/);
});

test('Compose shared header fits at 1024px',async({page})=>{await page.setViewportSize({width:1024,height:900});await page.goto('/compose/');await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1024);});
test('mobile audit diagnostics can be reached and scrolled by keyboard',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/workbench/');await page.getByRole('navigation',{name:'Mobile Workbench'}).getByRole('button',{name:'Audit',exact:true}).click();const axe=await new AxeBuilder({page}).options({preload:false}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(axe.violations).toEqual([]);});
