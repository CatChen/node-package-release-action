import type { Release } from '@octokit/webhooks-types';
import { type ReleaseType } from 'semver';
type ReleaseTransactionState = {
    completed: boolean;
    dryRun: boolean;
    initialBranchName: string | null;
    initialHeadSha: string | null;
    releaseTag: string | null;
    pushBranchCompleted: boolean;
    releaseCreated: boolean;
    updateShorthandReleaseRequested: boolean;
    updateShorthandReleaseCompleted: boolean;
};
export declare function nodePackageRelease({ githubToken, directory, releaseType, prerelease, updateShorthandRelease, skipIfNoDiff, diffTargets, dryRun, state, }: {
    githubToken: string;
    directory: string;
    releaseType: ReleaseType;
    prerelease: boolean;
    updateShorthandRelease: boolean;
    skipIfNoDiff: boolean;
    diffTargets: string;
    dryRun: boolean;
    state?: ReleaseTransactionState;
}): Promise<Release | undefined>;
export {};
