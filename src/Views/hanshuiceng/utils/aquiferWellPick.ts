/**
 * Cesium pick 解析（不依赖 Cesium 运行时，便于 Node 测试）。
 */

type PickedEntity = {
    id?: unknown;
    properties?: {
        aquiferWellId?: { getValue?: () => unknown } | string;
        aquiferDepthEnvelope?: { getValue?: () => unknown } | boolean;
    };
};

export type AquiferWellSceneHover = {
    readonly wellId: string | null;
    readonly onEnvelope: boolean;
};

const readProperty = (property: unknown): unknown => {
    if (
        typeof property === "object" &&
        property !== null &&
        typeof (property as { getValue?: () => unknown }).getValue === "function"
    ) {
        return (property as { getValue: () => unknown }).getValue();
    }
    return property;
};

export const getAquiferWellIdFromPicked = (
    picked: { id?: unknown } | undefined,
): string | null => {
    const entity = picked?.id as PickedEntity | undefined;
    if (!entity) return null;

    const value = readProperty(entity.properties?.aquiferWellId);
    if (typeof value === "string" && value.length > 0) {
        return value;
    }

    if (typeof entity.id === "string") {
        const match = entity.id.match(
            /^aquifer-well-(?:marker|stick)-(.+)$/,
        );
        if (match) return match[1];
    }

    return null;
};

export const isAquiferDepthEnvelopePicked = (
    picked: { id?: unknown } | undefined,
): boolean => {
    const entity = picked?.id as PickedEntity | undefined;
    if (!entity) return false;

    const flagged = readProperty(entity.properties?.aquiferDepthEnvelope);
    if (flagged === true) return true;

    return typeof entity.id === "string" && entity.id === "aquifer-depth-envelope";
};

/**
 * 从 drillPick 结果解析悬停目标。
 * 井优先于包络，避免半透明包络面与井柱交替命中导致闪烁。
 */
export const resolveAquiferWellSceneHover = (
    picks: ReadonlyArray<{ id?: unknown } | undefined | null>,
): AquiferWellSceneHover => {
    let wellId: string | null = null;
    let onEnvelope = false;

    for (const picked of picks) {
        if (!picked) continue;
        const id = getAquiferWellIdFromPicked(picked);
        if (id) {
            wellId = id;
            break;
        }
    }

    if (!wellId) {
        for (const picked of picks) {
            if (!picked) continue;
            if (isAquiferDepthEnvelopePicked(picked)) {
                onEnvelope = true;
                break;
            }
        }
    }

    return { wellId, onEnvelope };
};
