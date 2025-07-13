import "dotenv/config";
import Browserbase from "@browserbasehq/sdk";

const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;
const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY;

const bb = new Browserbase({
  apiKey: BROWSERBASE_API_KEY,
});

// Get the session replay for the given session id
const replay = await bb.sessions.recording.retrieve("1aa8f1f6-b7e0-40c5-b4e0-52ce607e9f6e");
console.log(replay);    