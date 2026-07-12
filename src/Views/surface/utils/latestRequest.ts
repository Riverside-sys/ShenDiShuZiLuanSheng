export interface LatestRequestGuard {
    begin: () => () => boolean;
    invalidate: () => void;
}

export const createLatestRequestGuard = (): LatestRequestGuard => {
    let version = 0;

    return {
        begin: () => {
            const requestVersion = ++version;
            return () => requestVersion === version;
        },
        invalidate: () => {
            version += 1;
        },
    };
};
