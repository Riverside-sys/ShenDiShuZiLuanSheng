import {
    getAquiferWellLog,
    type AquiferLogChannelId,
    type AquiferLogDepthRange,
} from "../../../data/aquifer/logs/index.ts";
import {
    SU95_STRATIGRAPHY,
    SU95_STRATIGRAPHY_SUMMARY,
    type Su95StratigraphyLayer,
} from "../../../data/aquifer/stratigraphy/index.ts";

export type AquiferResearchTab = "log" | "stratigraphy";
export type AquiferLogPoint = readonly [value: number | null, depth: number];

const CHANNEL_COLORS: Record<AquiferLogChannelId, string> = {
    sp: "#26d9ff",
    resistivity: "#ffb84d",
    naturalEncoded: "#f4df62",
    compensatedDensity: "#65f6c5",
    compensatedAcoustic: "#b99cff",
};

const LITHOLOGY_COLORS: Record<string, string> = {
    油页岩: "#4f5964",
    泥岩: "#60748a",
    泥灰岩: "#8da5aa",
    泥质粉砂岩: "#849a78",
    玄武岩: "#4b4c57",
    砂岩: "#d6a766",
    砂砾岩: "#bc8157",
    粉砂岩: "#c7ad72",
    粉砂质泥岩: "#7d8978",
    粉砂质粘土: "#a98272",
    粗砂岩: "#c58d54",
    粘土: "#9c6f65",
    细砂岩: "#d7b87b",
    软泥岩: "#718596",
};

export interface AquiferLogChannelPresentation {
    readonly id: AquiferLogChannelId;
    readonly label: string;
    readonly interpretation: string;
    readonly color: string;
    readonly minimum: number;
    readonly maximum: number;
    readonly validSampleCount: number;
    readonly points: readonly AquiferLogPoint[];
}

export interface AquiferLogPresentation {
    readonly wellId: string;
    readonly originalSampleCount: number;
    readonly visualizationSampleCount: number;
    readonly sourceDepthRange: AquiferLogDepthRange;
    readonly declaredDepthRange: AquiferLogDepthRange;
    readonly channels: readonly AquiferLogChannelPresentation[];
    readonly visualizationSubsetOnly: true;
}

export interface Su95LayerPresentation extends Su95StratigraphyLayer {
    readonly displayColor: string;
}

export interface AquiferStratigraphyPresentation {
    readonly wellId: "苏95";
    readonly layers: readonly Su95LayerPresentation[];
    readonly summary: typeof SU95_STRATIGRAPHY_SUMMARY;
    readonly singleWellOnly: true;
}

export interface AquiferResearchPresentation {
    readonly wellId: string;
    readonly availableTabs: readonly AquiferResearchTab[];
    readonly log?: AquiferLogPresentation;
    readonly stratigraphy?: AquiferStratigraphyPresentation;
}

const createLogPresentation = (wellId: string): AquiferLogPresentation | undefined => {
    const log = getAquiferWellLog(wellId);
    if (!log) {
        return undefined;
    }

    return {
        wellId: log.wellId,
        originalSampleCount: log.originalSampleCount,
        visualizationSampleCount: log.samples.length,
        sourceDepthRange: log.sourceDepthRange,
        declaredDepthRange: log.declaredDepthRange,
        channels: log.channels.map((channel) => ({
            id: channel.id,
            label: channel.sourceLabel,
            interpretation: channel.interpretation,
            color: CHANNEL_COLORS[channel.id],
            minimum: channel.minimum,
            maximum: channel.maximum,
            validSampleCount: channel.validSampleCount,
            points: log.samples.map((sample) => [
                sample.values[channel.id] ?? null,
                sample.depth,
            ]),
        })),
        visualizationSubsetOnly: true,
    };
};

const SU95_LAYER_PRESENTATIONS: readonly Su95LayerPresentation[] = Object.freeze(
    SU95_STRATIGRAPHY.map((layer) =>
        Object.freeze({
            ...layer,
            displayColor: LITHOLOGY_COLORS[layer.lithology] ?? "#73808b",
        }),
    ),
);

export const createAquiferResearchPresentation = (
    wellId: string,
): AquiferResearchPresentation | undefined => {
    const log = createLogPresentation(wellId);
    const stratigraphy = wellId === "苏95"
        ? {
            wellId: "苏95" as const,
            layers: SU95_LAYER_PRESENTATIONS,
            summary: SU95_STRATIGRAPHY_SUMMARY,
            singleWellOnly: true as const,
        }
        : undefined;
    const availableTabs: AquiferResearchTab[] = [];

    if (log) {
        availableTabs.push("log");
    }
    if (stratigraphy) {
        availableTabs.push("stratigraphy");
    }
    if (availableTabs.length === 0) {
        return undefined;
    }

    return {
        wellId,
        availableTabs: Object.freeze(availableTabs),
        log,
        stratigraphy,
    };
};
