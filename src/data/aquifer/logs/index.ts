import {
    GENERATED_AQUIFER_LOGS,
    type GeneratedAquiferLog,
} from "./logs.generated.ts";

const WELL_IDS = [
    "N参1",
    "洋3",
    "新3",
    "涟1",
    "苏107",
    "苏118",
    "苏80",
    "阜3",
] as const;

const CHANNEL_IDS = [
    "sp",
    "resistivity",
    "naturalEncoded",
    "compensatedDensity",
    "compensatedAcoustic",
] as const;

export type AquiferLogWellId = (typeof WELL_IDS)[number];
export type AquiferLogChannelId = (typeof CHANNEL_IDS)[number];

export interface AquiferLogDepthRange {
    readonly minimum: number;
    readonly maximum: number;
}

export interface AquiferLogSourceSheet {
    readonly name: string;
    readonly rowCount: number;
    readonly columnCount: number;
    readonly headerRow: number;
    readonly headers: readonly string[];
    readonly dataRowCount: number;
}

export interface AquiferLogSource {
    readonly workbookName: string;
    readonly selectedSheetName: string;
    readonly headerRow: number;
    readonly wellIdMappingNote?: string;
    readonly sheets: readonly AquiferLogSourceSheet[];
}

export interface AquiferLogChannelMetadata {
    readonly id: AquiferLogChannelId;
    readonly sourceLabel: string;
    readonly interpretation: string;
    readonly unit: null;
    readonly validSampleCount: number;
    readonly missingSampleCount: number;
    readonly minimum: number;
    readonly maximum: number;
}

export interface AquiferLogSample {
    readonly depth: number;
    readonly values: Readonly<Partial<Record<AquiferLogChannelId, number>>>;
}

export interface AquiferWellLog {
    readonly wellId: AquiferLogWellId;
    readonly source: AquiferLogSource;
    readonly declaredDepthRange: AquiferLogDepthRange;
    readonly sourceDepthRange: AquiferLogDepthRange;
    readonly declaredSamplingInterval: number;
    readonly originalSampleCount: number;
    readonly isVisualizationSampled: boolean;
    readonly channels: readonly AquiferLogChannelMetadata[];
    /**
     * Deterministic visualization subset of original rows. Missing source cells
     * are omitted from values; no values are interpolated.
     */
    readonly samples: readonly AquiferLogSample[];
}

const isWellId = (value: string): value is AquiferLogWellId =>
    (WELL_IDS as readonly string[]).includes(value);

const isChannelId = (value: string): value is AquiferLogChannelId =>
    (CHANNEL_IDS as readonly string[]).includes(value);

const requireWellId = (value: string): AquiferLogWellId => {
    if (!isWellId(value)) {
        throw new Error(`生成数据包含未知井 ID：${value}`);
    }
    return value;
};

const requireChannelId = (value: string): AquiferLogChannelId => {
    if (!isChannelId(value)) {
        throw new Error(`生成数据包含未知测井通道：${value}`);
    }
    return value;
};

const createSource = (source: GeneratedAquiferLog["source"]): AquiferLogSource =>
    Object.freeze({
        ...source,
        sheets: Object.freeze(
            source.sheets.map((sheet) =>
                Object.freeze({
                    ...sheet,
                    headers: Object.freeze([...sheet.headers]),
                }),
            ),
        ),
    });

const createWellLog = (generated: GeneratedAquiferLog): AquiferWellLog => {
    const wellId = requireWellId(generated.wellId);
    const channelOrder = generated.channelOrder.map(requireChannelId);
    const channels = generated.channels.map((channel) =>
        Object.freeze({
            ...channel,
            id: requireChannelId(channel.id),
        }),
    );
    const samples = generated.samples.map(([depth, ...sourceValues]) => {
        const values: Partial<Record<AquiferLogChannelId, number>> = {};
        sourceValues.forEach((value, index) => {
            const channelId = channelOrder[index];
            if (value !== null && channelId !== undefined) {
                values[channelId] = value;
            }
        });
        return Object.freeze({
            depth,
            values: Object.freeze(values),
        });
    });

    return Object.freeze({
        wellId,
        source: createSource(generated.source),
        declaredDepthRange: Object.freeze({ ...generated.declaredDepthRange }),
        sourceDepthRange: Object.freeze({ ...generated.sourceDepthRange }),
        declaredSamplingInterval: generated.declaredSamplingInterval,
        originalSampleCount: generated.originalSampleCount,
        isVisualizationSampled: generated.isVisualizationSampled,
        channels: Object.freeze(channels),
        samples: Object.freeze(samples),
    });
};

export const AQUIFER_LOG_WELL_IDS: readonly AquiferLogWellId[] = Object.freeze([
    ...WELL_IDS,
]);

export const AQUIFER_WELL_LOGS: readonly AquiferWellLog[] = Object.freeze(
    GENERATED_AQUIFER_LOGS.map(createWellLog),
);

const actualWellIds = AQUIFER_WELL_LOGS.map(({ wellId }) => wellId);
if (actualWellIds.some((wellId, index) => wellId !== WELL_IDS[index])) {
    throw new Error("生成测井数据的井 ID 或顺序与公开清单不一致");
}

const WELL_LOG_BY_ID = new Map(
    AQUIFER_WELL_LOGS.map((well) => [well.wellId, well] as const),
);

export const AQUIFER_LOG_DATASET_SUMMARY = Object.freeze({
    wellCount: AQUIFER_WELL_LOGS.length,
    originalSampleCount: AQUIFER_WELL_LOGS.reduce(
        (sum, well) => sum + well.originalSampleCount,
        0,
    ),
    visualizationSampleCount: AQUIFER_WELL_LOGS.reduce(
        (sum, well) => sum + well.samples.length,
        0,
    ),
    maxVisualizationSamplesPerWell: 1_200,
    samplesAreVisualizationSubset: true,
});

export const getAquiferWellLog = (
    wellId: string,
): AquiferWellLog | undefined => WELL_LOG_BY_ID.get(wellId as AquiferLogWellId);
