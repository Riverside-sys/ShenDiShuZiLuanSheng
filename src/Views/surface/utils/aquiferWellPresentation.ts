import type {
    AquiferWell,
    AquiferWellResourceType,
} from "../../../data/aquifer/types";
import {
    getAquiferWellDocument,
    type AquiferWellDocument,
} from "../../../data/aquifer/documents/index.ts";

const RESOURCE_LABELS: Record<AquiferWellResourceType, string> = {
    "structured-log": "结构化测井数据",
    "grapher-project": "Grapher 工程",
    stratigraphy: "地层资料",
    "column-diagram": "柱状图",
    "scanned-document": "扫描文档",
};

export interface AquiferWellPresentation {
    readonly id: string;
    readonly name: string;
    readonly longitude: string;
    readonly latitude: string;
    readonly northing: string;
    readonly easting: string;
    readonly wellType: string;
    readonly completionDate: string;
    readonly region: string;
    readonly resourceLabels: readonly string[];
    readonly hasResearchData: boolean;
    readonly hasInteractiveResearchData: boolean;
    readonly scannedDocument?: AquiferWellDocument;
}

export const createAquiferWellPresentation = (
    well: AquiferWell,
): AquiferWellPresentation => ({
    id: well.id,
    name: well.name,
    longitude: well.longitude.toFixed(6),
    latitude: well.latitude.toFixed(6),
    northing: well.cgcs2000.northing.toFixed(3),
    easting: well.cgcs2000.easting.toFixed(3),
    wellType: well.wellType ?? "暂无记录",
    completionDate: well.completionDate ?? "暂无记录",
    region: well.region ?? "暂无记录",
    resourceLabels: well.resources.map((resource) => RESOURCE_LABELS[resource]),
    hasResearchData: well.resources.length > 0,
    hasInteractiveResearchData: well.resources.some(
        (resource) => resource === "structured-log" || resource === "stratigraphy",
    ),
    scannedDocument: getAquiferWellDocument(well.id),
});
