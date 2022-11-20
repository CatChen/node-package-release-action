import type { Octokit } from "@octokit/core";
import type { Api } from "@octokit/plugin-rest-endpoint-methods/dist-types/types";
export declare function getlatestReleaseTag(owner: string, repo: string, octokit: Octokit & Api): Promise<string | null>;
