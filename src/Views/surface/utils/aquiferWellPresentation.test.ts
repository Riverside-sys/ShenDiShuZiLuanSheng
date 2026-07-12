import assert from "node:assert/strict";
import test from "node:test";

import type { AquiferWell } from "../../../data/aquifer/types.ts";
import { createAquiferWellPresentation } from "./aquiferWellPresentation.ts";

const wellWithResearchData: AquiferWell = {
    id: "苏80",
    name: "苏80",
    longitude: 119.39883213,
    latitude: 33.72235383,
    cgcs2000: {
        northing: 3733027.248,
        easting: 444280.798,
    },
    wellType: "预探井",
    completionDate: "1976-08-26",
    region: "涟水",
    resources: ["structured-log", "grapher-project"],
};

test("格式化井位坐标、元数据和资料名称", () => {
    assert.deepEqual(createAquiferWellPresentation(wellWithResearchData), {
        id: "苏80",
        name: "苏80",
        longitude: "119.398832",
        latitude: "33.722354",
        northing: "3733027.248",
        easting: "444280.798",
        wellType: "预探井",
        completionDate: "1976-08-26",
        region: "涟水",
        resourceLabels: ["结构化测井数据", "Grapher 工程"],
        hasResearchData: true,
        hasInteractiveResearchData: true,
        scannedDocument: undefined,
    });
});

test("缺失元数据和资料时给出明确占位信息", () => {
    const coordinateOnlyWell: AquiferWell = {
        ...wellWithResearchData,
        id: "示例井",
        name: "示例井",
        wellType: undefined,
        completionDate: undefined,
        region: undefined,
        resources: [],
    };

    const presentation = createAquiferWellPresentation(coordinateOnlyWell);

    assert.equal(presentation.wellType, "暂无记录");
    assert.equal(presentation.completionDate, "暂无记录");
    assert.equal(presentation.region, "暂无记录");
    assert.deepEqual(presentation.resourceLabels, []);
    assert.equal(presentation.hasResearchData, false);
    assert.equal(presentation.hasInteractiveResearchData, false);
    assert.equal(presentation.scannedDocument, undefined);
});

test("洋3井附带可预览的原始剖面扫描图", () => {
    const yang3: AquiferWell = {
        ...wellWithResearchData,
        id: "洋3",
        name: "洋3",
        resources: ["structured-log", "scanned-document"],
    };

    const presentation = createAquiferWellPresentation(yang3);
    assert.equal(presentation.scannedDocument?.wellId, "洋3");
    assert.equal(
        presentation.scannedDocument?.url,
        "/aquifer/documents/yang3-section.jpg",
    );
    assert.equal(presentation.scannedDocument?.actionLabel, "查看原始剖面图");
});

test("石4井附带综合柱状图预览入口", () => {
    const shi4: AquiferWell = {
        ...wellWithResearchData,
        id: "石4井",
        name: "石4井",
        resources: ["column-diagram"],
    };

    const presentation = createAquiferWellPresentation(shi4);
    assert.equal(presentation.hasInteractiveResearchData, false);
    assert.equal(presentation.scannedDocument?.wellId, "石4井");
    assert.equal(presentation.scannedDocument?.actionLabel, "查看综合柱状图");
    assert.equal(
        presentation.scannedDocument?.url,
        "/aquifer/documents/shi4-column.jpg",
    );
});
