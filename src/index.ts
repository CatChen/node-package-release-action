import { notice, error } from "@actions/core";
import { getLastGitTag } from "./getLastGitTag";
import { getPackageVersion } from "./getPackageVersion";

async function run(): Promise<void> {
  const lastGitTag = await getLastGitTag();
  notice(`Last git tag: ${lastGitTag}`);
  const packageVersion = await getPackageVersion();
  notice(`package.json version: ${packageVersion}`);
}

async function cleanup(): Promise<void> {
  error("Post action needs to be implemented or removed.");
}

if (!process.env["STATE_isPost"]) {
  run();
} else {
  cleanup();
}
