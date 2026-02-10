import type { Octokit } from '@octokit/core';
import type { Api } from '@octokit/plugin-rest-endpoint-methods';
import type { Release } from '@octokit/webhooks-types';
export declare function createRelease(owner: string, repo: string, version: string, prerelease: boolean, dryRun: boolean, octokit: Octokit & Api): Promise<Release | undefined>;
