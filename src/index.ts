import { notice, error, getInput, setFailed } from "@actions/core";
import { getOctokit } from "./getOctokit";
import { context } from "@actions/github";
import { getLastGitTag } from "./getLastGitTag";
import { getPackageVersion } from "./getPackageVersion";
import { getLatestRelease } from "./getLatestRelease";
import { rsort, inc } from "semver";

const RELEASE_TYPES = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease",
] as const;

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
  const highestVersion = rsort(versions)[0];
  notice(`Highest version: ${highestVersion}`);

  const releaseType = RELEASE_TYPES.find(
    (releaseType) => getInput("release-type").toLowerCase() === releaseType
  );
  if (releaseType === undefined) {
    setFailed(`Invalid release-type input: ${getInput("release-type")}`);
    return;
  }
  const releaseVersion = inc(highestVersion, releaseType);
  if (releaseVersion === null) {
    setFailed("Failed to compute release version");
    return;
  }
  notice(`Release version: ${releaseVersion}`);
}

async function cleanup(): Promise<void> {
  error("Post action needs to be implemented or removed.");
}

if (!process.env["STATE_isPost"]) {
  run();
} else {
  cleanup();
}
