import {test,expect} from '@playwright/test';
test('mobile navigation traps focus, closes with Escape and returns focus',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const toggle=page.getByRole('button',{name:'Toggle menu'});await expect(toggle).toBeEnabled();await toggle.focus();await toggle.press('Enter');
 const dialog=page.getByRole('dialog',{name:'Main navigation'});await expect(dialog).toBeVisible();
 const links=dialog.locator('a');await links.last().focus();await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Close navigation'})).toBeFocused();
 await page.keyboard.press('Escape');await expect(toggle).toHaveAttribute('aria-expanded','false');await expect(toggle).toBeFocused();
});
