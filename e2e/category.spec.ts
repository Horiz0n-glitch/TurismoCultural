import { test, expect } from '@playwright/test';

test.describe('Category Page', () => {
  test('displays category header with category name', async ({ page }) => {
    await page.goto('/categoria/noticias');
    await expect(page.locator('.category-header h1')).toBeVisible();
  });

  test('displays article cards in category', async ({ page }) => {
    await page.goto('/categoria/noticias');
    const cards = page.locator('.article-card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('breadcrumb exists with Inicio link', async ({ page }) => {
    await page.goto('/categoria/noticias');
    const inicioLink = page.locator('nav a', { hasText: 'Inicio' }).first();
    await expect(inicioLink).toBeVisible();
  });
});
