import "dotenv/config";
import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";

if (!process.env.BROWSERBASE_API_KEY || !process.env.BROWSERBASE_PROJECT_ID) {
  throw new Error("Missing required environment variables. Please check your .env file.");
}

const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;
const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY;

const bb = new Browserbase({
  apiKey: BROWSERBASE_API_KEY,
});

(async () => {
  // Create a new session
  const session = await bb.sessions.create({
    projectId: BROWSERBASE_PROJECT_ID,
  });

  // Connect to the session
  const browser = await chromium.connectOverCDP(session.connectUrl);

  // Getting the default context to ensure the sessions are recorded.
  const defaultContext = browser.contexts()[0];
  const page = defaultContext?.pages()[0];

  // Navigate to the Browserbase docs and wait for 10 seconds
  await page.goto("https://docs.browserbase.com/introduction");
  await page.waitForTimeout(10000);
  await page.close();
  await browser.close();

  // Log the session replay URL
  console.log(
    `Session complete! View replay at https://browserbase.com/sessions/${session.id}`,
  );
})().catch((error) => console.error(error.message));