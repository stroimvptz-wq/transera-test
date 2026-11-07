const { test, expect } = require('@playwright/test');
test('digits append to the right in all calculator number fields', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-page="calculators"]').click();
  for (const key of ['distance','rate','markup','extraCharge']) {
    const field=page.locator('[data-field="'+key+'"]');
    await field.fill('');
    await field.press('1'); await field.press('2'); await field.press('3'); await field.press('4');
    await expect(field).toHaveValue('1234');
    await field.press('Backspace');
    await expect(field).toHaveValue('123');
  }
});
test('calculation updates without changing focus or reversing input', async ({ page }) => {
 await page.goto('/');
 await page.locator('[data-page="calculators"]').click();
 const distance=page.locator('[data-field="distance"]');
 await distance.fill('');
 await distance.pressSequentially('1000');
 await expect(distance).toHaveValue('1000');
 await expect(distance).toBeFocused();
 const rate=page.locator('[data-field="rate"]');
 await rate.fill('');
 await rate.pressSequentially('50');
 await expect(rate).toHaveValue('50');
 await expect(page.locator('#live-results')).toContainText('50 000');
});
