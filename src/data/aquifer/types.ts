export type AquiferWellResourceType =
    | "structured-log"
    | "grapher-project"
    | "stratigraphy"
    | "column-diagram"
    | "scanned-document";

export interface AquiferWell {
    readonly id: string;
    readonly name: string;
    readonly longitude: number;
    readonly latitude: number;
    readonly cgcs2000: {
        readonly northing: number;
        readonly easting: number;
    };
    readonly wellType?: string;
    readonly completionDate?: string;
    readonly region?: string;
    readonly resources: readonly AquiferWellResourceType[];
}

export interface AquiferWellDatasetSummary {
    readonly total: number;
    readonly withMetadata: number;
    readonly withStructuredLog: number;
    readonly withGrapherProject: number;
    readonly withStratigraphy: number;
    readonly withColumnDiagram: number;
    readonly withScannedDocument: number;
}
