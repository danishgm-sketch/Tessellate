import {test,expect} from '@playwright/test';
test('actual forwarded React primitives load in the public preview',async({page})=>{
 await page.goto('/preview-content/?resource=button');
 await expect(page.getByRole('button',{name:'Click me',exact:true})).toBeVisible();
 await expect(page.getByText('Preview failed:',{exact:false})).toHaveCount(0);
 await page.goto('/preview-content/?resource=input');
 await expect(page.getByRole('textbox').first()).toBeVisible();
});
