import type { Octokit } from '@octokit/core';
import type { Api } from '@octokit/plugin-rest-endpoint-methods';
export declare function getLatestReleaseTag(owner: string, repo: string, octokit: Octokit & Api): Promise<string | null>;
