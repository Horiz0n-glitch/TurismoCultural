import { test, expect } from '@playwright/test';

test.describe('Category Page', () => {
  test('displays category header with category name', async ({ page }) => {
    await page.goto('/categoria/noticias');
    await expect(page.locator('.category-header h1')).toBeVisible();
  });

  test('starts with zero articles in each initial category', async ({ page }) => {
    await page.goto('/categoria/noticias');
    const cards = page.locator('.article-card');
    await expect(cards).toHaveCount(0);
    await expect(page.getByText('No hay artículos en esta categoría')).toBeVisible();
  });

  test('an empty category offers a link back to home', async ({ page }) => {
    await page.goto('/categoria/noticias');
    const inicioLink = page.getByRole('link', { name: 'Volver al inicio' });
    await expect(inicioLink).toBeVisible();
  });
});
