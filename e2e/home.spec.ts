import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads and displays hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toContainText('Descubre el Turismo Cultural');
  });

  test('starts with zero articles and an editorial empty state', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.article-card');
    await expect(cards).toHaveCount(0);
    await expect(page.getByText('Próximamente, nuevas historias')).toBeVisible();
  });

  test('displays category pills', async ({ page }) => {
    await page.goto('/');
    const pills = page.locator('.category-pill');
    expect(await pills.count()).toBeGreaterThan(0);
  });

  test('does not feature historical articles on a new site', async ({ page }) => {
    await page.goto('/');
    const featuredLink = page.locator('.hero-featured-card');
    await expect(featuredLink).toHaveCount(0);
  });
});
