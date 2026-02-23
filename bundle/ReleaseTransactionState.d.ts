export declare const STATE_IS_POST = "isPost";
export type ReleaseTransactionState = {
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
export declare function saveReleaseTransactionState(state: ReleaseTransactionState): void;
export declare function updateReleaseTransactionState(state: ReleaseTransactionState, updates: Partial<ReleaseTransactionState>): void;
export declare function loadReleaseTransactionState(): ReleaseTransactionState | null;
export declare function createReleaseTransactionState({ dryRun, updateShorthandReleaseRequested, }: {
    dryRun: boolean;
    updateShorthandReleaseRequested: boolean;
}): Promise<ReleaseTransactionState>;
