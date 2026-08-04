import { test, expect } from '@playwright/test';

test.describe('Article Page', () => {
  test('displays article title and content when navigating from home', async ({ page }) => {
    await page.goto('/');
    const firstArticleLink = page.locator('.article-card .card-title a').first();
    await expect(firstArticleLink).toBeVisible();
    await firstArticleLink.click();
    await page.waitForSelector('.article-single h1');
    await expect(page.locator('.article-single h1')).toBeVisible();
    await expect(page.locator('.article-content')).toBeVisible();
  });

  test('displays breadcrumb with Inicio link', async ({ page }) => {
    await page.goto('/');
    await page.locator('.article-card .card-title a').first().click();
    await page.waitForSelector('.article-single');
    await expect(page.locator('nav a', { hasText: 'Inicio' }).first()).toBeVisible();
  });

  test('displays category tags when navigating to article', async ({ page }) => {
    await page.goto('/');
    await page.locator('.article-card .card-title a').first().click();
    await page.waitForSelector('.article-single');
    const categoryLink = page.locator('.article-category');
    await expect(categoryLink).toBeVisible();
  });
});
