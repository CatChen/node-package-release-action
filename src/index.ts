import { notice, getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { rsort, inc } from "semver";
import { getOctokit } from "./getOctokit";
import { getLastGitTag } from "./getLastGitTag";
import { getPackageVersion } from "./getPackageVersion";
import { getLatestRelease } from "./getLatestRelease";
import { configGit } from "./configGit";
import { setVersion } from "./setVersion";
import { pushBranch } from "./pushBranch";
import { createRelease } from "./createRelease";

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

  await configGit();

  await setVersion(releaseVersion);

  await pushBranch();

  await createRelease(owner, repo, releaseVersion, octokit);
}

run();
