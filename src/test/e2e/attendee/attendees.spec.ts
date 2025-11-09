import { test, expect, type Page, type Locator } from "@playwright/test";

const EVENT_ID = process.env.E2E_EVENT_ID; // optional shortcut

test.describe("Attendees — add & delete", () => {
  test.beforeEach(async ({ page }) => {
    // login
    await page.goto("/login");
    await page.getByRole("textbox", { name: "Username" }).fill("lushuwen");
    await page.getByRole("textbox", { name: "Password" }).fill("lushuwen");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/\/events(\?|$)/);

    // go to Attendees
    await gotoAttendees(page);
  });

  test("add attendee → verify in list → delete → verify gone", async ({ page }) => {
    test.setTimeout(45_000);

    // unique record (use email as primary key to assert)
    const email  = `e2e_${Date.now()}@example.com`;
    const name   = "E2E User";
    const mobile = "81234567";

    // open modal
    await page.getByRole("button", { name: /^Add attendee$/i }).click();

    // fill & submit
    await page.getByRole("textbox", { name: /^Email$/ }).fill(email);
    await page.getByRole("textbox", { name: /^Name$/ }).fill(name);
    await page.getByRole("textbox", { name: /^Mobile$/ }).fill(mobile);
    await page.getByRole("button", { name: /^Add attendee$/i }).click();

    // success dialog
    await expect(page.locator(".swal2-popup")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /^OK$/i }).click();

    // verify in list
    const row = rowByText(page, email);
    await expect(row).toBeVisible({ timeout: 15_000 });

    // delete from that exact row
    await clickDeleteInRow(row);
    await expect(page.getByRole("dialog")).toContainText(/Delete attendee\?/i);
    await page.getByRole("button", { name: /^Yes, delete$/i }).click();

    // deletion success
    await expect(page.getByRole("dialog")).toContainText(/Deleted/i);
    await page.getByRole("button", { name: /^OK$/i }).click();

    // verify gone
    await expect(rowByText(page, email)).toHaveCount(0);

    // still gone after reload
    await page.reload();
    await ensureAttendeesReady(page); // re-assert page ready after reload
    await expect(rowByText(page, email)).toHaveCount(0);
  });
});

/* ------------------------- helpers ------------------------- */

async function gotoAttendees(page: Page) {
  if (EVENT_ID) {
    // direct deep-link if provided
    await page.goto(`/event/${EVENT_ID}/attendees`, { waitUntil: "domcontentloaded" });
  } else {
    // navigate via Events list
    await expect(page.getByRole("button", { name: /Go to event/i }).first()).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Go to event/i }).first().click();
    await page.getByRole("link", { name: /^Attendees$/i }).click();
  }
  await ensureAttendeesReady(page);
}

async function ensureAttendeesReady(page: Page) {
  // stable control on the page chrome instead of heading text
  await expect(page.getByRole("button", { name: /^Add attendee$/i })).toBeVisible({ timeout: 15_000 });
  await page.waitForSelector("table"); // skeleton -> table
}

function rowByText(page: Page, text: string): Locator {
  return page.locator("table").first().locator("tbody tr", { hasText: text }).first();
}

/** Click the Delete button inside a given row, with hover/visibility fallbacks. */
async function clickDeleteInRow(row: Locator) {
  await row.scrollIntoViewIfNeeded();
  await row.hover();

  const byRole = row.getByRole("button", { name: /^Delete$/i });
  try {
    await expect(byRole).toBeVisible({ timeout: 3000 });
    await byRole.click();
    return;
  } catch {
    const byText = row.getByText(/^Delete$/).first();
    if (await byText.count()) {
      await byText.scrollIntoViewIfNeeded();
      await byText.click({ force: true });
      return;
    }
    const generic = row.locator('button:has-text("Delete"), [role="button"]:has-text("Delete")').first();
    await generic.scrollIntoViewIfNeeded();
    await generic.click({ force: true });
  }
}