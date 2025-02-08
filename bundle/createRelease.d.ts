import type { Octokit } from '@octokit/core';
import type { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
import type { Release } from '@octokit/webhooks-types/schema';
export declare function createRelease(owner: string, repo: string, version: string, prerelease: boolean, dryRun: boolean, octokit: Octokit & Api): Promise<Release | undefined>;
