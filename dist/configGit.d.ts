import type { Octokit } from '@octokit/core';
import type { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
export declare const GITHUB_ACTION_USER_NAME = "GitHub Action";
export declare const GITHUB_ACTION_USER_EMAIL = "41898282+github-actions[bot]@users.noreply.github.com";
export declare function configGit(octokit: Octokit & Api): Promise<void>;
