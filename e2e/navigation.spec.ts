import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('quienes-somos page loads', async ({ page }) => {
    await page.goto('/quienes-somos');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('sitemap.xml returns valid XML', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.ok()).toBeTruthy();
    const text = await response?.text();
    expect(text).toContain('<urlset');
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.ok()).toBeTruthy();
  });

  test('footer contact link navigates to /contacto', async ({ page }) => {
    await page.goto('/');
    const footerContact = page.locator('.site-footer a', { hasText: 'Contacto' });
    if (await footerContact.isVisible()) {
      await footerContact.click();
      await expect(page).toHaveURL('/contacto');
    }
  });
});
