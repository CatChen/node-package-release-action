import type { components } from '@octokit/openapi-types/types.js';
export declare function nodePackageRelease(githubToken: string): Promise<components['schemas']['release'] | undefined>;
