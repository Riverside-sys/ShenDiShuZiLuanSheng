import { AQUIFER_WELLS, findAquiferWellById } from "../wells.ts";
import { AQUIFER_WELL_LOGS } from "../logs/index.ts";
import { SU95_STRATIGRAPHY_SUMMARY } from "../stratigraphy/index.ts";

export interface AquiferLonLat {
    readonly longitude: number;
    readonly latitude: number;
}

export interface AquiferWellSurfaceMarker {
    readonly wellId: string;
    readonly longitude: number;
    readonly latitude: number;
    readonly hasDepthStick: boolean;
}

export interface AquiferWellDepthStick {
    readonly wellId: string;
    readonly longitude: number;
    readonly latitude: number;
    /** 测深顶，米，向下为正。 */
    readonly topDepth: number;
    /** 测深底，米，向下为正。 */
    readonly bottomDepth: number;
    readonly source: "structured-log" | "stratigraphy";
}

export interface AquiferDepthEnvelope {
    /** 凸包顶点，逆时针，不重复闭合点。 */
    readonly polygon: readonly AquiferLonLat[];
    /** 包络顶面测深（米，向下为正）。由浅部起测井的顶深均值得到。 */
    readonly topDepth: number;
    /** 包络底面测深（米，向下为正）。由浅部起测井的底深均值得到。 */
    readonly bottomDepth: number;
    readonly controlWellIds: readonly string[];
}

export interface AquiferWellSceneGeometry {
    readonly surfaceMarkers: readonly AquiferWellSurfaceMarker[];
    readonly wellSticks: readonly AquiferWellDepthStick[];
    readonly depthEnvelope: AquiferDepthEnvelope;
    readonly centroid: AquiferLonLat;
    readonly disclaimer: string;
}

export interface AquiferWellSceneSummary {
    readonly totalWells: number;
    readonly wellsWithDepthSticks: number;
    readonly envelopeVertexCount: number;
    readonly envelopeTopDepth: number;
    readonly envelopeBottomDepth: number;
}

const ENVELOPE_SHALLOW_TOP_LIMIT_M = 500;

const buildDepthSticks = (): AquiferWellDepthStick[] => {
    const sticks: AquiferWellDepthStick[] = [];

    for (const log of AQUIFER_WELL_LOGS) {
        const well = findAquiferWellById(log.wellId);
        if (!well) continue;
        sticks.push({
            wellId: well.id,
            longitude: well.longitude,
            latitude: well.latitude,
            topDepth: log.sourceDepthRange.minimum,
            bottomDepth: log.sourceDepthRange.maximum,
            source: "structured-log",
        });
    }

    const su95 = findAquiferWellById("苏95");
    if (su95) {
        sticks.push({
            wellId: su95.id,
            longitude: su95.longitude,
            latitude: su95.latitude,
            topDepth: SU95_STRATIGRAPHY_SUMMARY.depthRange.minimum,
            bottomDepth: SU95_STRATIGRAPHY_SUMMARY.depthRange.maximum,
            source: "stratigraphy",
        });
    }

    return sticks;
};

const cross = (
    origin: AquiferLonLat,
    a: AquiferLonLat,
    b: AquiferLonLat,
): number =>
    (a.longitude - origin.longitude) * (b.latitude - origin.latitude) -
    (a.latitude - origin.latitude) * (b.longitude - origin.longitude);

/** Andrew monotone chain；输入至少 1 点。 */
export const buildConvexHull = (
    points: readonly AquiferLonLat[],
): AquiferLonLat[] => {
    const unique = new Map<string, AquiferLonLat>();
    for (const point of points) {
        unique.set(`${point.longitude},${point.latitude}`, point);
    }
    const sorted = [...unique.values()].sort((a, b) =>
        a.longitude === b.longitude
            ? a.latitude - b.latitude
            : a.longitude - b.longitude,
    );

    if (sorted.length <= 2) {
        return sorted;
    }

    const lower: AquiferLonLat[] = [];
    for (const point of sorted) {
        while (
            lower.length >= 2 &&
            cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
        ) {
            lower.pop();
        }
        lower.push(point);
    }

    const upper: AquiferLonLat[] = [];
    for (let index = sorted.length - 1; index >= 0; index -= 1) {
        const point = sorted[index];
        while (
            upper.length >= 2 &&
            cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
        ) {
            upper.pop();
        }
        upper.push(point);
    }

    lower.pop();
    upper.pop();
    return [...lower, ...upper];
};

const average = (values: readonly number[]): number => {
    if (values.length === 0) {
        return 0;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const buildDepthEnvelope = (
    sticks: readonly AquiferWellDepthStick[],
): AquiferDepthEnvelope => {
    const shallowControls = sticks.filter(
        (stick) => stick.topDepth < ENVELOPE_SHALLOW_TOP_LIMIT_M,
    );
    const controls = shallowControls.length >= 3 ? shallowControls : sticks;
    const polygon = buildConvexHull(
        controls.map((stick) => ({
            longitude: stick.longitude,
            latitude: stick.latitude,
        })),
    );

    return {
        polygon,
        topDepth: average(controls.map((stick) => stick.topDepth)),
        bottomDepth: average(controls.map((stick) => stick.bottomDepth)),
        controlWellIds: controls.map((stick) => stick.wellId),
    };
};

export const buildAquiferWellSceneGeometry = (): AquiferWellSceneGeometry => {
    const wellSticks = buildDepthSticks();
    const stickIds = new Set(wellSticks.map((stick) => stick.wellId));
    const surfaceMarkers = AQUIFER_WELLS.map((well) => ({
        wellId: well.id,
        longitude: well.longitude,
        latitude: well.latitude,
        hasDepthStick: stickIds.has(well.id),
    }));
    const depthEnvelope = buildDepthEnvelope(wellSticks);
    const centroid = {
        longitude: average(surfaceMarkers.map((marker) => marker.longitude)),
        latitude: average(surfaceMarkers.map((marker) => marker.latitude)),
    };

    return {
        surfaceMarkers,
        wellSticks,
        depthEnvelope,
        centroid,
        disclaimer:
            "井网示意三维：井柱取自真实测井/苏95深度范围；半透明体为浅部起测井深度包络凸包，不是含水层解释体，也不是吉大 .ovobj 原网格。",
    };
};

export const AQUIFER_WELL_SCENE_GEOMETRY: AquiferWellSceneGeometry =
    buildAquiferWellSceneGeometry();

export const AQUIFER_WELL_SCENE_SUMMARY: AquiferWellSceneSummary = Object.freeze({
    totalWells: AQUIFER_WELL_SCENE_GEOMETRY.surfaceMarkers.length,
    wellsWithDepthSticks: AQUIFER_WELL_SCENE_GEOMETRY.wellSticks.length,
    envelopeVertexCount: AQUIFER_WELL_SCENE_GEOMETRY.depthEnvelope.polygon.length,
    envelopeTopDepth: AQUIFER_WELL_SCENE_GEOMETRY.depthEnvelope.topDepth,
    envelopeBottomDepth: AQUIFER_WELL_SCENE_GEOMETRY.depthEnvelope.bottomDepth,
});
