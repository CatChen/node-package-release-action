import type { Release } from '@octokit/webhooks-types/schema';
import { type ReleaseType } from 'semver';
export declare function nodePackageRelease({ githubToken, directory, releaseType, prerelease, updateShorthandRelease, skipIfNoDiff, diffTargets, dryRun, }: {
    githubToken: string;
    directory: string;
    releaseType: ReleaseType;
    prerelease: boolean;
    updateShorthandRelease: boolean;
    skipIfNoDiff: boolean;
    diffTargets: string;
    dryRun: boolean;
}): Promise<Release | undefined>;
