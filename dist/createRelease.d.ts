import type { Octokit } from '@octokit/core';
import type { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
export declare function createRelease(owner: string, repo: string, version: string, octokit: Octokit & Api): Promise<void>;
