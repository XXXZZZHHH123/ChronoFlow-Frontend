// src/test/e2e/LoginFlow.test.js
import { describe, it, expect } from "vitest";
import { By, until } from "selenium-webdriver";
import { buildDriver } from "./driverSetup.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const FRONTEND_URL = process.env.VITE_FRONTEND_URL;
const USERNAME = process.env.E2E_USER || "lushuwen1";
const PASSWORD = process.env.E2E_PASS || "lushuwen1";

/** Ensure we land on the login page with the username field visible. */
async function openLoginPage(driver) {
  // Best-effort logout: clear cookies + storage first
  try {
    await driver.manage().deleteAllCookies();
  } catch {}
  try {
    await driver.get(FRONTEND_URL);
    await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
  } catch {}

  // Try direct /login first
  try {
    await driver.get(`${FRONTEND_URL}/login`);
    const u = await driver.wait(until.elementLocated(By.id("username")), 6000);
    return u; // success
  } catch {
    // Fallback: go to root and wait for login or redirect to login
    await driver.get(FRONTEND_URL);
    const usernameCandidates = await driver.findElements(By.id("username"));
    if (usernameCandidates.length > 0) return usernameCandidates[0];
    // If still not visible, wait a bit for the page to render and try again
    const u = await driver.wait(until.elementLocated(By.id("username")), 6000);
    return u;
  }
}

async function doLogin(driver, { username = USERNAME, password = PASSWORD, expectPath = "/events" } = {}) {
  const u = await openLoginPage(driver);
  const p = await driver.findElement(By.id("password"));
  const btn = await driver.findElement(By.css("button[type='submit']"));

  await u.clear(); await u.sendKeys(username);
  await p.clear(); await p.sendKeys(password);
  await btn.click();

  // For correct creds, wait for the app to route away to target page
  if (username === USERNAME && password === PASSWORD) {
    await driver.wait(until.urlContains(expectPath), 12000);
  }
}

describe("Login Flow (E2E)", () => {
  it(
    "should allow a user to log in",
    async () => {
      const driver = await buildDriver();
      try {
        await driver.manage().window().maximize();
        await doLogin(driver, { expectPath: "/events" });
        const url = await driver.getCurrentUrl();
        expect(url).toContain("/events");
      } finally {
        await driver.quit();
      }
    },
    40_000
  );

  it(
    "should block login with wrong password and stay on login page",
    async () => {
      const driver = await buildDriver(); // ✅ fresh, unauthenticated session
      try {
        await driver.manage().window().maximize();

        // Open login and submit wrong password
        const u = await openLoginPage(driver);
        const p = await driver.findElement(By.id("password"));
        const btn = await driver.findElement(By.css("button[type='submit']"));

        await u.clear(); await u.sendKeys(USERNAME);
        await p.clear(); await p.sendKeys("wrong-password");
        await btn.click();

        // Expect: either still on /login OR error banner visible
        // (Adjust selectors to your app’s UI if needed)
        await driver.sleep(300); // tiny debounce for UI to update
        const url = await driver.getCurrentUrl();
        if (url.includes("/login")) {
          expect(url).toContain("/login");
        } else {
          const err = await driver.findElements(
            By.xpath(
              "//*[contains(.,'Invalid') or contains(.,'incorrect') or contains(@class,'error') or contains(@class,'alert')]"
            )
          );
          expect(err.length).toBeGreaterThan(0);
        }
      } finally {
        await driver.quit();
      }
    },
    45_000
  );
});
