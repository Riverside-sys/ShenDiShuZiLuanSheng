import { SU95_STRATIGRAPHY } from "./su95.generated.ts";
import type {
    Su95StratigraphyLayer,
    Su95StratigraphySummary,
} from "./types.ts";

export { SU95_STRATIGRAPHY };
export type {
    Su95StratigraphyLayer,
    Su95StratigraphySummary,
} from "./types.ts";

const firstLayer = SU95_STRATIGRAPHY[0];
const lastLayer = SU95_STRATIGRAPHY[SU95_STRATIGRAPHY.length - 1];

const lithologyCountEntries = new Map<string, number>();
let totalThickness = 0;
let depthGapCount = 0;
let totalGapThickness = 0;

for (const [index, layer] of SU95_STRATIGRAPHY.entries()) {
    totalThickness += layer.thickness;
    lithologyCountEntries.set(
        layer.lithology,
        (lithologyCountEntries.get(layer.lithology) ?? 0) + 1,
    );

    const nextLayer = SU95_STRATIGRAPHY[index + 1];
    if (nextLayer && nextLayer.topDepth > layer.bottomDepth) {
        depthGapCount += 1;
        totalGapThickness += nextLayer.topDepth - layer.bottomDepth;
    }
}

const lithologyCounts = Object.freeze(
    Object.fromEntries(
        [...lithologyCountEntries.entries()].sort(([left], [right]) =>
            left < right ? -1 : left > right ? 1 : 0,
        ),
    ),
);

export const SU95_STRATIGRAPHY_SUMMARY: Su95StratigraphySummary = Object.freeze({
    totalLayers: SU95_STRATIGRAPHY.length,
    depthRange: Object.freeze({
        minimum: firstLayer.topDepth,
        maximum: lastLayer.bottomDepth,
    }),
    totalThickness,
    depthGapCount,
    totalGapThickness,
    lithologyCounts,
});

/**
 * 查询苏95单井指定深度所在的真实分层。
 *
 * 普通层位使用 `[顶深, 底深)`，最终孔底深度 3040 m 归入最后一层；
 * 原始资料中的深度间断和有效范围外均返回 `undefined`。
 */
export function findSu95LayerAtDepth(
    depth: number,
): Su95StratigraphyLayer | undefined {
    if (
        !Number.isFinite(depth)
        || depth < firstLayer.topDepth
        || depth > lastLayer.bottomDepth
    ) {
        return undefined;
    }

    let lowerBound = 0;
    let upperBound = SU95_STRATIGRAPHY.length - 1;
    let candidateIndex = -1;

    while (lowerBound <= upperBound) {
        const middleIndex = Math.floor((lowerBound + upperBound) / 2);
        const layer = SU95_STRATIGRAPHY[middleIndex];
        if (layer.topDepth <= depth) {
            candidateIndex = middleIndex;
            lowerBound = middleIndex + 1;
        } else {
            upperBound = middleIndex - 1;
        }
    }

    if (candidateIndex < 0) {
        return undefined;
    }

    const candidate = SU95_STRATIGRAPHY[candidateIndex];
    const includesBottomBoundary =
        candidateIndex === SU95_STRATIGRAPHY.length - 1
        && depth === candidate.bottomDepth;
    return depth < candidate.bottomDepth || includesBottomBoundary
        ? candidate
        : undefined;
}
