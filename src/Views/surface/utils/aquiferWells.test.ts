import assert from "node:assert/strict";
import test from "node:test";

import { AQUIFER_WELLS } from "../../../data/aquifer/wells.ts";
import { createAquiferWellGeoJson } from "./aquiferWells.ts";

test("将 37 口井转换为 GeoJSON Point Feature", () => {
    const geoJson = createAquiferWellGeoJson(AQUIFER_WELLS);

    assert.equal(geoJson.type, "FeatureCollection");
    assert.equal(geoJson.features.length, 37);
    assert.ok(geoJson.features.every((feature) => feature.geometry.type === "Point"));
});

test("GeoJSON 保留井坐标、元数据和资料可用性", () => {
    const geoJson = createAquiferWellGeoJson(AQUIFER_WELLS);
    const su80 = geoJson.features.find((feature) => feature.id === "苏80");
    const unknownMetadataWell = geoJson.features.find(
        (feature) => feature.id === "N参1",
    );

    assert.deepEqual(su80?.geometry.coordinates, [119.39883213, 33.72235383]);
    assert.deepEqual(su80?.properties, {
        wellId: "苏80",
        name: "苏80",
        wellType: "预探井",
        completionDate: "1976-08-26",
        region: "涟水",
        resources: ["structured-log", "grapher-project"],
        resourceCount: 2,
        hasResearchData: true,
    });
    assert.equal(unknownMetadataWell?.properties.wellType, null);
    assert.equal(unknownMetadataWell?.properties.region, null);
});

test("无附加资料的井被明确标记为仅坐标", () => {
    const geoJson = createAquiferWellGeoJson(AQUIFER_WELLS);
    const su76 = geoJson.features.find((feature) => feature.id === "苏76");

    assert.equal(su76?.properties.resourceCount, 0);
    assert.equal(su76?.properties.hasResearchData, false);
});
