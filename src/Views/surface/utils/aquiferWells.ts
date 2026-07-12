import type {
    AquiferWell,
    AquiferWellResourceType,
} from "../../../data/aquifer/types";

export interface AquiferWellGeoJsonProperties {
    readonly wellId: string;
    readonly name: string;
    readonly wellType: string | null;
    readonly completionDate: string | null;
    readonly region: string | null;
    readonly resources: readonly AquiferWellResourceType[];
    readonly resourceCount: number;
    readonly hasResearchData: boolean;
}

export interface AquiferWellGeoJsonFeature {
    readonly type: "Feature";
    readonly id: string;
    readonly geometry: {
        readonly type: "Point";
        readonly coordinates: readonly [number, number];
    };
    readonly properties: AquiferWellGeoJsonProperties;
}

export interface AquiferWellGeoJson {
    readonly type: "FeatureCollection";
    readonly features: readonly AquiferWellGeoJsonFeature[];
}

export const createAquiferWellGeoJson = (
    wells: readonly AquiferWell[],
): AquiferWellGeoJson => ({
    type: "FeatureCollection",
    features: wells.map((well) => ({
        type: "Feature",
        id: well.id,
        geometry: {
            type: "Point",
            coordinates: [well.longitude, well.latitude],
        },
        properties: {
            wellId: well.id,
            name: well.name,
            wellType: well.wellType ?? null,
            completionDate: well.completionDate ?? null,
            region: well.region ?? null,
            resources: [...well.resources],
            resourceCount: well.resources.length,
            hasResearchData: well.resources.length > 0,
        },
    })),
});
