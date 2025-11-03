// src/test/e2e/OrganizerDashboardFlow.test.js
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { By, until } from "selenium-webdriver";
import { buildDriver } from "./driverSetup.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const FRONTEND_URL = process.env.VITE_FRONTEND_URL;
const USERNAME = process.env.E2E_USER || "lushuwen1";
const PASSWORD = process.env.E2E_PASS || "lushuwen1";

let driver;

async function login() {
  await driver.get(FRONTEND_URL);

  const usernameInput = await driver.wait(until.elementLocated(By.id("username")), 10_000);
  await driver.wait(until.elementIsVisible(usernameInput), 5_000);

  const passwordInput = await driver.findElement(By.id("password"));
  const loginButton = await driver.findElement(By.css("button[type='submit']"));

  await usernameInput.clear();
  await usernameInput.sendKeys(USERNAME);
  await passwordInput.clear();
  await passwordInput.sendKeys(PASSWORD);
  await loginButton.click();

  // Your app redirects to /events after login
  await driver.wait(until.urlContains("/events"), 10_000);
}

describe(
  "Organiser Dashboard (E2E)",
  () => {
    beforeAll(
      async () => {
        driver = await buildDriver();
        await driver.manage().window().maximize();
      },
      30_000
    );

    afterAll(
      async () => {
        if (driver) await driver.quit();
      },
      30_000
    );

    it(
      "✅ shows dashboard sections after successful login",
      async () => {
        await login();

        // Navigate explicitly (in case landing page isn't the dashboard)
        await driver.get(`${FRONTEND_URL}/organiser-dashboard`);

        // Header
        await driver.wait(
          until.elementLocated(By.xpath("//*[contains(text(),'Organizer Dashboard')]")),
          12_000
        );

        // Four metric cards by their titles
        await driver.wait(until.elementLocated(By.xpath("//*[normalize-space()='Total Events']")), 8_000);
        await driver.wait(until.elementLocated(By.xpath("//*[normalize-space()='Starting Soon']")), 8_000);
        await driver.wait(until.elementLocated(By.xpath("//*[normalize-space()='Registrations']")), 8_000);
        await driver.wait(until.elementLocated(By.xpath("//*[normalize-space()='Open Tasks']")), 8_000);

        // “Events Overview” section
        await driver.wait(until.elementLocated(By.xpath("//*[normalize-space()='Events Overview']")), 8_000);
      },
      40_000
    );

    it(
      "❌ redirects unauthenticated users to login when visiting /organiser-dashboard",
      async () => {
        // Hard logout: clear cookies + storage
        await driver.manage().deleteAllCookies();
        await driver.get(`${FRONTEND_URL}/blank`); // small hop avoids SPA caching
        await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");

        // Now try to access dashboard directly
        await driver.get(`${FRONTEND_URL}/organiser-dashboard`);

        // Expect login page (username input)
        await driver.wait(until.elementLocated(By.id("username")), 10_000);

        // Ensure dashboard header is NOT present
        const hdr = await driver.findElements(
          By.xpath("//*[contains(text(),'Organizer Dashboard')]")
        );
        expect(hdr.length).toBe(0);
      },
      40_000
    );
  },
  80_000
);
