import { test, expect } from '@playwright/test';

test.describe('Pokédex and Debounce Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pokemon.html');
  });

  test('should display Pokédex header and initial Pokémon cards', async ({ page }) => {
    await expect(page.locator('.hero-title')).toHaveText('Pokémon Explorer');
    await expect(page.locator('#pokemonSearchInput')).toBeVisible();
    await expect(page.locator('#delayStatusBadge')).toBeVisible();

    // Verify initial cards loaded from PokéAPI
    const cards = page.locator('#pokemonGrid .card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should handle 4-second debounce search for a specific Pokémon', async ({ page }) => {
    const searchInput = page.locator('#pokemonSearchInput');
    await searchInput.fill('pikachu');

    // Debounce progress bar appears while countdown is active
    const progressBar = page.locator('#delayProgressBar');
    await expect(progressBar).toBeVisible();

    // After the 4-second debounce triggers, Pikachu card is displayed
    const cardTitle = page.locator('#pokemonGrid .card h3').first();
    await expect(cardTitle).toContainText(/pikachu/i, { timeout: 10000 });
  });

  test('should open Pokémon detail modal with chained data', async ({ page }) => {
    const firstCard = page.locator('#pokemonGrid .card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();

    const modal = page.locator('#pokemonDetailModal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.pokemon-detail-name')).toBeVisible();
  });
});
