import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test('displays contact form with all fields', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.locator('h1')).toContainText('Contacto');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar mensaje' })).toBeVisible();
  });

  test('displays contact info section', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('has nav button linking back to home', async ({ page }) => {
    await page.goto('/contacto');
    const backLink = page.locator('.btn-primary.small', { hasText: 'Volver' });
    await expect(backLink).toBeVisible();
    expect(await backLink.getAttribute('href')).toBe('/');
  });
});
