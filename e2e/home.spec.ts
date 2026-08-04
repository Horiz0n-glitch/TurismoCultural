import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads and displays hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toContainText('Descubre el Turismo Cultural');
  });

  test('displays article cards', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.article-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('displays category pills', async ({ page }) => {
    await page.goto('/');
    const pills = page.locator('.category-pill');
    expect(await pills.count()).toBeGreaterThan(0);
  });

  test('featured article links to article page', async ({ page }) => {
    await page.goto('/');
    const featuredLink = page.locator('.hero-featured-card');
    if (await featuredLink.isVisible()) {
      await featuredLink.click();
      await expect(page.locator('.article-single')).toBeVisible();
    }
  });
});
