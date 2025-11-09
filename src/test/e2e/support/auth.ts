// src/test/e2e/support/auth.ts
import { expect, type Page } from "@playwright/test";

export async function ensureLoggedIn(page: Page, user: string, pass: string) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  // Case A: redirected because a session already exists
  if (/\/events(\?|$)/.test(page.url())) {
    await expect(page.getByRole("button", { name: /create event/i }))
      .toBeVisible({ timeout: 15_000 });
    return;
  }

  // Case B: login form visible
  const username = page.getByRole("textbox", { name: /username/i });
  if (await username.isVisible().catch(() => false)) {
    await username.fill(user);
    await page.getByRole("textbox", { name: /password/i }).fill(pass);
    await page.getByRole("button", { name: /^login$/i }).click();
    await page.waitForURL(/\/events(\?|$)/, { timeout: 20_000 });
    await expect(page.getByText(/^Event Management$/)).toBeVisible({ timeout: 10_000 });
    return;
  }

  // Case C: already on some auth’d page but not /events
  await page.goto("/events", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/^Event Management$/)).toBeVisible({ timeout: 10_000 });
}