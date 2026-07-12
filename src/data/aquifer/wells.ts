import type {
    AquiferWell,
    AquiferWellDatasetSummary,
    AquiferWellResourceType,
} from "./types";

interface AquiferWellDetails {
    readonly wellType?: string;
    readonly completionDate?: string;
    readonly region?: string;
    readonly resources?: readonly AquiferWellResourceType[];
}

/**
 * 坐标来源：
 * - WGS84/CGCS2000：苏北盆地收集钻孔坐标校正后.xlsx
 * - 井别/完井日期/地区：测井资料数字化/其它/坐标.xlsx（仅按井号关联）
 * - resources：26-7吉大含水层资料中的实际文件清单
 */
const createWell = (
    id: string,
    longitude: number,
    latitude: number,
    northing: number,
    easting: number,
    details: AquiferWellDetails = {},
): AquiferWell => ({
    id,
    name: id,
    longitude,
    latitude,
    cgcs2000: { northing, easting },
    wellType: details.wellType,
    completionDate: details.completionDate,
    region: details.region,
    resources: details.resources ?? [],
});

export const AQUIFER_WELLS: readonly AquiferWell[] = Object.freeze([
    createWell("苏76", 119.54235182, 33.95808287, 3759106.277, 457699.344, {
        wellType: "预探井",
        completionDate: "1976-05-25",
        region: "涟水",
    }),
    createWell("苏80", 119.39883213, 33.72235383, 3733027.248, 444280.798, {
        wellType: "预探井",
        completionDate: "1976-08-26",
        region: "涟水",
        resources: ["structured-log", "grapher-project"],
    }),
    createWell("苏83", 119.89141972, 33.91531334, 3754273.169, 489958.888, {
        wellType: "预探井",
        completionDate: "1976-11-15",
        region: "阜宁",
        resources: ["scanned-document"],
    }),
    createWell("苏95", 120.29740253, 33.45103469, 3702811.172, 527650.998, {
        wellType: "预探井",
        completionDate: "1977-07-08",
        region: "盐城",
        resources: ["stratigraphy"],
    }),
    createWell("苏107", 119.45791514, 33.9104215, 3753857.566, 449866.814, {
        wellType: "预探井",
        completionDate: "1978-08-23",
        region: "涟水",
        resources: ["structured-log", "grapher-project"],
    }),
    createWell("苏118", 119.34104682, 33.67658647, 3727983.44, 438892.489, {
        wellType: "预探井",
        completionDate: "1978-11-11",
        region: "涟水",
        resources: ["structured-log", "grapher-project"],
    }),
    createWell("苏123", 119.09064975, 33.60533914, 3720256.825, 415601.967, {
        wellType: "预探井",
        completionDate: "1979-04-29",
        region: "淮安",
    }),
    createWell("苏131", 119.15804764, 33.52791773, 3711616.381, 421787.662, {
        wellType: "预探井",
        completionDate: "1979-09-03",
        region: "淮安",
    }),
    createWell("苏参1", 120.06131156, 33.52483457, 3710958.676, 505695.599, {
        wellType: "参数井",
        completionDate: "1983-04-26",
        region: "盐城",
    }),
    createWell("苏89", 120.27446717, 33.46891326, 3704788.275, 525513.339, {
        wellType: "预探井",
        completionDate: "1977-04-03",
        region: "盐城",
    }),
    createWell("N参1", 119.26501865, 33.51035727, 3709593.085, 431711.061, {
        resources: ["structured-log", "grapher-project"],
    }),
    createWell("B5", 119.46205713, 33.64213919, 3724097.615, 450094.545, {
        wellType: "区域剖面井",
        completionDate: "1960-07-29",
        region: "阜宁",
    }),
    createWell("D2", 119.84255979, 33.90482076, 3753115.175, 485438.711, {
        wellType: "区域剖面井",
        completionDate: "1960-06-15",
        region: "阜宁",
    }),
    createWell("滨1", 119.84130589, 34.00783313, 3764541.667, 485340.417, {
        wellType: "预探井",
        completionDate: "1958-07-10",
        region: "滨海",
    }),
    createWell("阜1", 119.70162868, 33.76085008, 3737174.876, 472357.974, {
        wellType: "区域剖面井",
        completionDate: "1958-05-07",
        region: "阜宁",
    }),
    createWell("阜2", 119.78034453, 33.77910131, 3739180.956, 479654.78, {
        wellType: "区域剖面井",
        completionDate: "1958-09-30",
        region: "阜宁",
    }),
    createWell("阜3", 119.55699576, 33.60288297, 3719701.667, 458883.523, {
        wellType: "区域剖面井",
        completionDate: "1977-05-26",
        region: "阜宁",
        resources: ["structured-log", "grapher-project"],
    }),
    createWell("阜基", 119.77571523, 33.82281427, 3744030.482, 479236.557, {
        wellType: "基准井",
        completionDate: "1959-01-25",
        region: "阜宁",
    }),
    createWell("蛤1", 119.90824824, 33.81449599, 3743088.9896, 491505.1507),
    createWell("华蛤1", 119.97896458, 33.77040293, 3738194.6615, 498051.4345),
    createWell("蛤3", 119.91749821, 33.79632493, 3741072.751, 492359.946, {
        wellType: "预探井",
        completionDate: "1960-04-06",
        region: "阜宁",
    }),
    createWell("灌1", 119.40045116, 34.00634759, 3764527.605, 444614.547, {
        wellType: "预探井",
        completionDate: "1976-07-01",
        region: "涟水",
    }),
    createWell("淮1", 119.39888344, 33.49894786, 3708247.532, 444141.641, {
        wellType: "预探井",
        completionDate: "1958-10-07",
        region: "苏家嘴大东",
    }),
    createWell("涟1", 119.31481623, 33.82211103, 3744140.982, 436567.218, {
        wellType: "预探井",
        completionDate: "1976-10-16",
        region: "涟水",
        resources: ["structured-log", "grapher-project"],
    }),
    createWell("涟2", 119.31595077, 33.78359434, 3739867.94, 436643.875, {
        wellType: "预探井",
        completionDate: "1977-01-31",
        region: "苏家嘴大东",
        resources: ["grapher-project"],
    }),
    createWell("射2", 120.38084487, 33.8762666, 3750002.051, 535235.303, {
        wellType: "预探井",
        completionDate: "1971-05-21",
        region: "塘洼大喇叭",
    }),
    createWell("射6", 120.23824481, 33.97958102, 3761422.106, 522015.485, {
        wellType: "预探井",
        completionDate: "1971-12-22",
        region: "阜宁",
    }),
    createWell("钦8", 119.41784843, 33.65473782, 3725517.2442, 446001.0773),
    createWell("钦24", 119.21392673, 33.61636315, 3721385.9008, 427053.0606),
    createWell("钦28", 119.31550237, 33.61317081, 3720964.8351, 436477.041),
    createWell("洋3", 120.37106598, 33.66106382, 3726128.641, 534416.496, {
        wellType: "预探井",
        completionDate: "1962-08-10",
        region: "盐城",
        resources: ["structured-log", "scanned-document"],
    }),
    createWell("盐深1", 120.37862384, 33.59726862, 3719055.233, 535143.391, {
        wellType: "预探井",
        completionDate: "1971-03-23",
        region: "盐城",
    }),
    createWell("新3", 120.37295848, 33.75505137, 3736554.187, 534554.367, {
        wellType: "预探井",
        completionDate: "1961-10-29",
        region: "盐城",
        resources: ["structured-log"],
    }),
    createWell("石4井", 119.29509153, 33.52366368, 3711049.607, 434515.2898, {
        resources: ["column-diagram"],
    }),
    createWell("ZK5", 119.29883365, 33.51180098, 3709731.4755, 434854.0411, {
        resources: ["column-diagram"],
    }),
    createWell("ZK6", 119.29782784, 33.50186323, 3708629.8439, 434753.1316, {
        resources: ["column-diagram"],
    }),
    createWell("C4", 119.65169938, 33.75338001, 3736360.8122, 467729.5526),
]);

const WELLS_BY_ID = new Map(AQUIFER_WELLS.map((well) => [well.id, well]));

const hasResource = (
    well: AquiferWell,
    resource: AquiferWellResourceType,
): boolean => well.resources.includes(resource);

export const AQUIFER_WELLS_WITH_STRUCTURED_LOG: readonly AquiferWell[] =
    Object.freeze(
        AQUIFER_WELLS.filter((well) => hasResource(well, "structured-log")),
    );

export const AQUIFER_WELL_DATASET_SUMMARY: AquiferWellDatasetSummary =
    Object.freeze({
        total: AQUIFER_WELLS.length,
        withMetadata: AQUIFER_WELLS.filter(
            (well) => well.wellType || well.completionDate || well.region,
        ).length,
        withStructuredLog: AQUIFER_WELLS_WITH_STRUCTURED_LOG.length,
        withGrapherProject: AQUIFER_WELLS.filter((well) =>
            hasResource(well, "grapher-project"),
        ).length,
        withStratigraphy: AQUIFER_WELLS.filter((well) =>
            hasResource(well, "stratigraphy"),
        ).length,
        withColumnDiagram: AQUIFER_WELLS.filter((well) =>
            hasResource(well, "column-diagram"),
        ).length,
        withScannedDocument: AQUIFER_WELLS.filter((well) =>
            hasResource(well, "scanned-document"),
        ).length,
    });

export const findAquiferWellById = (id: string): AquiferWell | undefined =>
    WELLS_BY_ID.get(id);
