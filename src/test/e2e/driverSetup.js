import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

export async function buildDriver() {
  const options = new chrome.Options();
  options.addArguments("--headless=new", "--no-sandbox");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  return driver;
}
