import { ReleaseType } from 'semver';
export declare function findLastSameReleaseTypeVersion(releaseVersion: string, releaseType: ReleaseType): Promise<string | null>;
