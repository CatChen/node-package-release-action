export declare const IS_POST = "isPost";
export type ReleaseTransactionState = {
    completed: boolean;
    dryRun: boolean;
    initialBranchName: string | null;
    initialHeadSha: string | null;
    releaseTag: string | null;
    pushBranchCompleted: boolean;
    releaseCreated: boolean;
    updateShorthandReleaseCompleted: boolean;
};
export declare function saveReleaseTransactionState({ dryRun, updateShorthandRelease, }: {
    dryRun: boolean;
    updateShorthandRelease: boolean;
}): Promise<ReleaseTransactionState>;
export declare function updateReleaseTransactionState(state: ReleaseTransactionState, updates: Partial<ReleaseTransactionState>): void;
export declare function loadReleaseTransactionState(): ReleaseTransactionState | null;
