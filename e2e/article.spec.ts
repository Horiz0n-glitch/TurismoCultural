import { test, expect } from '@playwright/test';

test.describe('Empty editorial site', () => {
  test('does not resolve a historical article ID without CMS content', async ({ page }) => {
    await page.goto('/articulo/1');
    // Next's streamed not-found responses may carry HTTP 200; assert the rendered denial.
    await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
    await expect(page.locator('.article-single')).toHaveCount(0);
  });

  test('does not resolve articles from a different site', async ({ page }) => {
    await page.goto('/articulo/nota-de-habitat');
    await expect(page.getByRole('heading', { name: 'Página no encontrada', exact: true })).toBeVisible();
    await expect(page.locator('.article-single')).toHaveCount(0);
  });

  test('keeps the initial sitemap free of article URLs', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).not.toContain('/articulo/');
  });
});
