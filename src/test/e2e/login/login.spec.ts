import { test, expect } from '@playwright/test';

// Resolve once, with a safe default
const BASE =
  process.env.VITE_TESTING_SERVER ||
  process.env.BASE_URL ||
  'https://chronoflow-frontend-testing.up.railway.app';

test.use({ baseURL: BASE });

const VALID_USER   = process.env.E2E_USER_LOGIN    ?? 'davidiss';
const VALID_PASS   = process.env.E2E_USER_PASSWORD ?? 'daviss123';
const INVALID_PASS = process.env.E2E_BAD_PASSWORD  ?? 'wrong-password';

test.beforeEach(async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#username')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.getByRole('button', { name: /^login$/i })).toBeVisible();
});

test.describe('Login', () => {
  test('unhappy: client-side validation on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /^login$/i }).click();
    await expect(page.locator('#username')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#password')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('p.text-sm.text-destructive').first()).toBeVisible();
  });

  test('unhappy: wrong password shows SweetAlert and stays on /login', async ({ page }) => {
    await page.locator('#username').fill(VALID_USER);
    await page.locator('#password').fill(INVALID_PASS);
    await page.getByRole('button', { name: /^login$/i }).click();

    const popup = page.locator('.swal2-popup');
    await expect(popup).toBeVisible();
    await expect(popup).toContainText(/login failed/i);

    await page.locator('.swal2-confirm').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('happy: correct credentials redirect to /events and remember is persisted', async ({ page }) => {
    const remember = page.locator('#remember');
    await remember.click();
    await expect(remember).toHaveAttribute('aria-checked', 'true');

    await page.locator('#username').fill(VALID_USER);
    await page.locator('#password').fill(VALID_PASS);
    await page.getByRole('button', { name: /^login$/i }).click();

    await expect(page).toHaveURL(/\/events/);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('cf.remember')))
      .toBe('1');
  });
});