import { test, expect, type Locator } from "@playwright/test";

test.describe("Event Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("textbox", { name: "Username" }).fill("lushuwen");
    await page.getByRole("textbox", { name: "Password" }).fill("lushuwen");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*events/);
  });

  test("creates a new event successfully", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Create event" }).click();
    await expect(page.getByRole("textbox", { name: "Name" })).toBeVisible();

    await page.getByRole("textbox", { name: "Name" }).fill("new event");
    await page
      .getByRole("textbox", { name: "Description (optional)" })
      .fill("event description");
    await page.getByRole("textbox", { name: "Location" }).fill("event venue");

    // Start date/time
    await page
      .getByRole("button", { name: "MM/DD/YYYY hh:mm aa" })
      .first()
      .click();
    await page.getByRole("button", { name: "Sunday, November 23rd," }).click();
    await page.getByRole("button", { name: "8", exact: true }).click();
    await page.getByRole("button", { name: "20", exact: true }).click();
    await page.getByRole("button", { name: "PM" }).click();

    // End date/time
    await page.getByRole("button", { name: "MM/DD/YYYY hh:mm aa" }).click();
    await page.getByRole("button", { name: "Tuesday, November 25th," }).click();
    await page.getByRole("button", { name: "/25/2025 12:00 AM" }).click();

    await page
      .getByRole("textbox", { name: "Remark (optional)" })
      .fill("remarks");
    await page.getByRole("button", { name: "Create event" }).click();

    await expect(page.getByRole("button", { name: "OK" })).toBeVisible();
    await page.getByRole("button", { name: "OK" }).click();

    await expect(page.getByText("new event").nth(1)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("after creation, event appears in the list", async ({ page }) => {
    const name = `e2e list ${Date.now()}`;

    await page.getByRole("button", { name: "Create event" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("textbox", { name: "Location" }).fill("Main Hall");

    // Start
    await page
      .getByRole("button", { name: "MM/DD/YYYY hh:mm aa" })
      .first()
      .click();
    await page.getByRole("button", { name: "Sunday, November 23rd," }).click();
    await page.getByRole("button", { name: "8", exact: true }).click();
    await page.getByRole("button", { name: "20", exact: true }).click();
    await page.getByRole("button", { name: "PM" }).click();

    // End
    await page.getByRole("button", { name: "MM/DD/YYYY hh:mm aa" }).click();
    await page.getByRole("button", { name: "Tuesday, November 25th," }).click();
    await page.getByRole("button", { name: "/25/2025 12:00 AM" }).click();

    await page.getByRole("button", { name: "Create event" }).click();
    await page.getByRole("button", { name: "OK" }).click();

    await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 });
  });

  test("create → list → delete → verify gone", async ({ page }) => {
    test.setTimeout(45_000);

    const name = `e2e delete ${Date.now()}`;

    // Create
    await page.getByRole("button", { name: "Create event" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("textbox", { name: "Location" }).fill("Main Hall");

    // Start
    await page
      .getByRole("button", { name: "MM/DD/YYYY hh:mm aa" })
      .first()
      .click();
    await page.getByRole("button", { name: "Sunday, November 23rd," }).click();
    await page.getByRole("button", { name: "8", exact: true }).click();
    await page.getByRole("button", { name: "20", exact: true }).click();
    await page.getByRole("button", { name: "PM" }).click();

    // End
    await page
      .getByRole("button", { name: "MM/DD/YYYY hh:mm aa" })
      .last()
      .click();
    await page.getByRole("button", { name: "Tuesday, November 25th," }).click();
    await page.getByRole("button", { name: "/25/2025 12:00 AM" }).click();

    await page.getByRole("button", { name: "Create event" }).click();

    const swal = page.getByRole("dialog");
    await expect(swal).toContainText(/Event created/i, { timeout: 10_000 });
    await page.getByRole("button", { name: /^OK$/i }).click();

    // Helper: wait for the row with `name` to appear, with a reload fallback
    const findRow = (n: string) =>
      page.locator("tbody tr", { hasText: n }).first();

    async function waitForRowAppear(n: string) {
      const row = findRow(n);
      try {
        // First attempt: without reload
        await expect(row).toBeVisible({ timeout: 12_000 });
        return row;
      } catch {
        // If the list hasn't refreshed yet, reload once and try again
        await page.reload();
        await expect(findRow(n)).toBeVisible({ timeout: 12_000 });
        return findRow(n);
      }
    }

    const row = await waitForRowAppear(name);
    await row.scrollIntoViewIfNeeded();

    // Delete from that exact row
    await clickDeleteInRow(row);

    const confirm = page.getByRole("dialog");
    await expect(confirm).toContainText(/Delete event\?/i);
    await page.getByRole("button", { name: /^Yes, delete$/i }).click();

    const done = page.getByRole("dialog");
    await expect(done).toContainText(/Deleted/i);
    await page.getByRole("button", { name: /^OK$/i }).click();

    // Verify the row is gone
    await expect(findRow(name)).toHaveCount(0);

    // Still gone after reload
    await page.reload();
    await expect(findRow(name)).toHaveCount(0);
  });
});

/** Click the Delete button inside a given row, with hover/visibility fallbacks. */
async function clickDeleteInRow(row: Locator) {
  // ensure the row is in view and hover it (some UIs show actions only on hover)
  await row.scrollIntoViewIfNeeded();
  await row.hover();

  const byRole = row.getByRole("button", { name: /^Delete$/i });

  // try the normal visible button first
  try {
    await expect(byRole).toBeVisible({ timeout: 3000 });
    await byRole.click();
    return;
  } catch {
    // fallbacks: text selector or generic button with text, then force-click
    const byText = row.getByText(/^Delete$/).first();
    if (await byText.count()) {
      await byText.scrollIntoViewIfNeeded();
      await byText.click({ force: true });
      return;
    }
    const generic = row
      .locator('button:has-text("Delete"), [role="button"]:has-text("Delete")')
      .first();
    await generic.scrollIntoViewIfNeeded();
    await generic.click({ force: true });
  }
}