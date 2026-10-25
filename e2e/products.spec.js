import { test, expect } from '@playwright/test';

test.describe('Products Catalog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('should display hero title and catalog structure', async ({ page }) => {
    await expect(page.locator('.hero-title')).toHaveText('Product Catalog');
    await expect(page.locator('#searchInput')).toBeVisible();
    await expect(page.locator('#productsGrid')).toBeVisible();
  });

  test('should filter products instantly on search input', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('Keyboard');

    // Instant filter displays matching cards without delay
    const cards = page.locator('#productsGrid .card');
    await expect(cards.first()).toBeVisible();
  });

  test('should open product detail modal when clicking a card', async ({ page }) => {
    const firstCard = page.locator('#productsGrid .card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    const modal = page.locator('#productDetailModal');
    await expect(modal).toBeVisible();
  });
});
