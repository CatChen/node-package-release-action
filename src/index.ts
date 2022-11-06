import { notice, error } from "@actions/core";
import { getOctokit } from "./getOctokit";
import { context } from "@actions/github";
import { getLastGitTag } from "./getLastGitTag";
import { getPackageVersion } from "./getPackageVersion";
import { getLatestRelease } from "./getLatestRelease";
import { rsort } from "semver";

async function run(): Promise<void> {
  const lastGitTag = await getLastGitTag();
  notice(`Last git tag: ${lastGitTag}`);
  const packageVersion = await getPackageVersion();
  notice(`package.json version: ${packageVersion}`);

  const { owner, repo } = context.repo;
  const octokit = getOctokit();
  const latestRelease = await getLatestRelease(owner, repo, octokit);
  notice(`Latest release: ${latestRelease}`);

  const versions = [lastGitTag, packageVersion, latestRelease].flatMap(
    (version) => (version === null ? [] : [version])
  );
  const version = rsort(versions);
  notice(`Highest version: ${version}`);
}

async function cleanup(): Promise<void> {
  error("Post action needs to be implemented or removed.");
}

if (!process.env["STATE_isPost"]) {
  run();
} else {
  cleanup();
}
