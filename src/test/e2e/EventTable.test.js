// src/test/e2e/EventTable.test.js
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { By, until } from "selenium-webdriver";
import { buildDriver } from "./driverSetup.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const FRONTEND_URL = process.env.VITE_FRONTEND_URL;
const USERNAME = process.env.E2E_USER || "lushuwen1";
const PASSWORD = process.env.E2E_PASS || "lushuwen1";

describe("Event Table (E2E)", () => {
  let driver;

  async function login() {
    await driver.get(FRONTEND_URL);
    const username = await driver.wait(until.elementLocated(By.id("username")), 8000);
    const password = await driver.findElement(By.id("password"));
    const btn = await driver.findElement(By.css("button[type='submit']"));
    await username.sendKeys(USERNAME);
    await password.sendKeys(PASSWORD);
    await btn.click();
    await driver.wait(until.urlContains("/events"), 10000);
  }

  async function goEvents() {
    await driver.get(`${FRONTEND_URL}/events`);
    await driver.wait(until.elementLocated(By.css("table")), 10000);
  }

  // fresh retry-safe search for row containing "Delete"
  async function findRowWithDelete(maxWaitMs = 20000) {
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
      try {
        const empty = await driver.findElements(By.xpath("//*[normalize-space()='No results.']"));
        if (empty.length > 0) return null;

        const rows = await driver.findElements(By.xpath("//table//tbody/tr"));
        for (let i = 0; i < rows.length; i++) {
          try {
            // Re-find delete button fresh for each row
            const btn = await rows[i].findElement(By.xpath(".//button[normalize-space()='Delete']"));
            if (btn) return rows[i];
          } catch {
            // row may have re-rendered — ignore and continue
            continue;
          }
        }
      } catch {
        // table re-rendering, wait a bit
      }
      await driver.sleep(500);
    }
    return null;
  }

  async function openDeleteDialog(row) {
    // Re-locate the Delete button inside this row just before clicking
    const btn = await row.findElement(By.xpath(".//button[normalize-space()='Delete']"));
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", btn);
    await btn.click();
  }

  async function closeSwalByCancel() {
    const cancelBtn = await driver.wait(until.elementLocated(By.css(".swal2-cancel")), 8000);
    await cancelBtn.click();
    try {
      const swal = await driver.findElement(By.css(".swal2-container"));
      await driver.wait(until.elementIsNotVisible(swal), 8000);
    } catch {
      await driver.sleep(200);
    }
  }

  beforeAll(async () => {
    driver = await buildDriver();
    await driver.manage().window().maximize();
    await login();
    await goEvents();
  }, 40_000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  it(
    "❌ canceling delete keeps table visible (or validates empty state)",
    async () => {
      await driver.navigate().refresh();
      await driver.wait(until.urlContains("/events"), 10000);
      await driver.sleep(1000);

      const row = await findRowWithDelete(20000);
      if (!row) {
        const empty = await driver.findElements(By.xpath("//*[normalize-space()='No results.']"));
        expect(empty.length).toBeGreaterThan(0);
        console.log("\x1b[33m%s\x1b[0m", "⚠️ No events; validated empty state.");
        return;
      }

      await openDeleteDialog(row);
      // Only cancel the dialog to ensure we do NOT mutate backend data
      await closeSwalByCancel();

      const tableElem = await driver.findElement(By.css("table"));
      expect(await tableElem.isDisplayed()).toBe(true);
      console.log("\x1b[33m%s\x1b[0m", "⚠️ Negative: Cancel worked, table still visible");
    },
    35_000
  );

  // NOTE: positive confirm-delete test removed to avoid mutating real backend data.
});
