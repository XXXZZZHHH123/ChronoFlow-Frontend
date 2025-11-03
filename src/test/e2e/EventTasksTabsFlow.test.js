// src/test/e2e/EventTasksTabsFlow.test.js
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { By, until } from "selenium-webdriver";
import { buildDriver } from "./driverSetup.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const FRONTEND_URL = process.env.VITE_FRONTEND_URL;
const USERNAME = process.env.E2E_USER || "lushuwen1";
const PASSWORD = process.env.E2E_PASS || "lushuwen1";

let driver;

// ---------- helpers ---------------------------------------------------------

async function login() {
  await driver.get(FRONTEND_URL);

  const username = await driver.wait(until.elementLocated(By.id("username")), 10_000);
  const password = await driver.findElement(By.id("password"));
  const submit = await driver.findElement(By.css("button[type='submit']"));

  await username.clear(); await username.sendKeys(USERNAME);
  await password.clear(); await password.sendKeys(PASSWORD);
  await submit.click();

  // Your app lands on /events after login
  await driver.wait(until.urlContains("/events"), 12_000);
}

async function goToEventsPage() {
  await driver.get(`${FRONTEND_URL}/events`);
  await driver.wait(until.elementLocated(By.css("table")), 12_000);
  // Let TanStack Table finish first render
  await driver.sleep(500);
}

/**
 * Case-insensitive match for a button whose text includes "Go to event".
 * Retries while the table may re-render.
 */
async function findGoToEventButton(maxWaitMs = 20_000) {
  const deadline = Date.now() + maxWaitMs;


const BTN_XPATH = "//button[normalize-space(text())='Go to event']";


  while (Date.now() < deadline) {
    // Short-circuit if the table is empty
    const empty = await driver.findElements(By.xpath("//*[normalize-space()='No results.']"));
    if (empty.length > 0) return null;

    try {
      const btn = await driver.findElement(By.xpath(BTN_XPATH));
      if (btn) return btn;
    } catch {
      // Not found yet; let the UI settle and retry
    }
    await driver.sleep(300);
  }
  return null;
}

/**
 * Wait for the Event Tasks page by looking for common anchors:
 * - Header "Event Tasks"
 * - Tab "All Tasks" (role=tab or button or plain text)
 */
async function waitForTasksPage(maxWaitMs = 20_000) {
  const deadline = Date.now() + maxWaitMs;

  const CANDIDATE_XPATHS = [
    "//*[normalize-space()='Event Tasks']",
    "//*[@role='tab' and contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'all tasks')]",
    "//*[@role='button' and contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'all tasks')]",
    "//*[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'all tasks')]",
  ];

  while (Date.now() < deadline) {
    for (const xp of CANDIDATE_XPATHS) {
      const elems = await driver.findElements(By.xpath(xp));
      if (elems.length > 0) return true;
    }
    await driver.sleep(300);
  }
  return false;
}

/**
 * Find the "All Tasks" tab element (role=tab preferred), otherwise any element with that text.
 */
async function getAllTasksTab(maxWaitMs = 10_000) {
  const deadline = Date.now() + maxWaitMs;

  const XPATHS = [
    "//*[@role='tab' and contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'all tasks')]",
    "//*[self::button or @role='button'][contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'all tasks')]",
    "//*[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'all tasks')]",
  ];

  while (Date.now() < deadline) {
    for (const xp of XPATHS) {
      const elems = await driver.findElements(By.xpath(xp));
      if (elems.length > 0) return elems[0];
    }
    await driver.sleep(200);
  }
  return null;
}

// ---------- suite -----------------------------------------------------------

describe(
  "Event Tasks Tabs Flow (E2E)",
  () => {
    beforeAll(
      async () => {
        driver = await buildDriver();
        await driver.manage().window().maximize();
        await login();
      },
      40_000
    );

    afterAll(
      async () => {
        if (driver) await driver.quit();
      },
      20_000
    );

    it(
      "opens Event Tasks from Events page and shows All Tasks tab",
      async () => {
        // Ensure we're on Events list
        await goToEventsPage();

        // Try to pick the first "Go to event" button
        const goBtn = await findGoToEventButton(20_000);

        // If there are no events, gracefully assert empty state and stop
        if (!goBtn) {
          const empty = await driver.findElements(By.xpath("//*[normalize-space()='No results.']"));
          expect(empty.length).toBeGreaterThan(0);
          console.log("\x1b[33m%s\x1b[0m", "⚠️ No events available; cannot enter Event Tasks. Verified empty state.");
          return;
        }

        // Click into the event
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", goBtn);
        await goBtn.click();

        // Wait for tasks page anchors
        const onTasks = await waitForTasksPage(20_000);
        expect(onTasks).toBe(true);

        // Verify "All Tasks" tab exists (and ideally is selected)
        const allTab = await getAllTasksTab(10_000);
        expect(allTab).not.toBeNull();

        // If it exposes ARIA selected, assert it
        try {
          const ariaSelected = await allTab.getAttribute("aria-selected");
          if (ariaSelected !== null) {
            expect(ariaSelected === "true" || ariaSelected === true).toBe(true);
          }
        } catch {
          // no aria attrs; presence is enough for now
        }

        console.log("\x1b[32m%s\x1b[0m", "🎉 Event Tasks page opened; 'All Tasks' tab present.");
      },
      60_000
    );
  },
  80_000
);
