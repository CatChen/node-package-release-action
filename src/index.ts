import { context } from "@actions/github";
import { info, error } from "@actions/core";

async function run(): Promise<void> {
  info(`This is the Action context: ${JSON.stringify(context)}`);
  error("Action needs to be implemented.");
}

async function cleanup(): Promise<void> {
  error("Post action needs to be implemented or removed.");
}

if (!process.env["STATE_isPost"]) {
  run();
} else {
  cleanup();
}
