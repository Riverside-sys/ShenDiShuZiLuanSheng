import {
    AQUIFER_LOG_DATASET_SUMMARY,
    AQUIFER_WELL_LOGS,
} from "../../../data/aquifer/logs/index.ts";
import { SU95_STRATIGRAPHY_SUMMARY } from "../../../data/aquifer/stratigraphy/index.ts";
import { AQUIFER_WELL_DATASET_SUMMARY } from "../../../data/aquifer/wells.ts";

export interface WellDepthSpan {
    readonly wellId: string;
    readonly minimum: number;
    readonly maximum: number;
    readonly span: number;
}

export interface LithologyShare {
    readonly name: string;
    readonly count: number;
    readonly percent: number;
}

export interface AquiferHudChartModel {
    readonly wellDepthSpans: readonly WellDepthSpan[];
    readonly lithologyShares: readonly LithologyShare[];
    readonly summaryCards: readonly {
        readonly label: string;
        readonly value: string;
    }[];
}

const toPercent = (count: number, total: number): number =>
    total === 0 ? 0 : Number(((count / total) * 100).toFixed(1));

export const createAquiferHudChartModel = (): AquiferHudChartModel => {
    const wellDepthSpans = AQUIFER_WELL_LOGS.map((well) => ({
        wellId: well.wellId,
        minimum: well.sourceDepthRange.minimum,
        maximum: well.sourceDepthRange.maximum,
        span: well.sourceDepthRange.maximum - well.sourceDepthRange.minimum,
    })).sort((left, right) => right.span - left.span);

    const lithologyShares = Object.entries(
        SU95_STRATIGRAPHY_SUMMARY.lithologyCounts,
    )
        .map(([name, count]) => ({
            name,
            count,
            percent: toPercent(count, SU95_STRATIGRAPHY_SUMMARY.totalLayers),
        }))
        .sort((left, right) => right.count - left.count);

    return {
        wellDepthSpans,
        lithologyShares,
        summaryCards: [
            {
                label: "校正井位",
                value: `${AQUIFER_WELL_DATASET_SUMMARY.total} 口`,
            },
            {
                label: "结构化测井",
                value: `${AQUIFER_LOG_DATASET_SUMMARY.wellCount} 口`,
            },
            {
                label: "测井原始点",
                value: AQUIFER_LOG_DATASET_SUMMARY.originalSampleCount.toLocaleString(),
            },
            {
                label: "苏95分层",
                value: `${SU95_STRATIGRAPHY_SUMMARY.totalLayers} 层`,
            },
        ],
    };
};
