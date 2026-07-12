import assert from "node:assert/strict";
import test from "node:test";

import {
    AQUIFER_LOG_DATASET_SUMMARY,
    AQUIFER_LOG_WELL_IDS,
    AQUIFER_WELL_LOGS,
    getAquiferWellLog,
} from "./index.ts";

const EXPECTED_WELL_IDS = [
    "N参1",
    "洋3",
    "新3",
    "涟1",
    "苏107",
    "苏118",
    "苏80",
    "阜3",
] as const;

test("包含 8 口确切井 ID，华洋3工作簿映射为洋3", () => {
    assert.deepEqual(AQUIFER_LOG_WELL_IDS, EXPECTED_WELL_IDS);
    assert.equal(AQUIFER_WELL_LOGS.length, 8);
    assert.equal(new Set(AQUIFER_WELL_LOGS.map((well) => well.wellId)).size, 8);
});

test("所有可视化样本深度严格递增且数值有限", () => {
    for (const well of AQUIFER_WELL_LOGS) {
        assert.ok(well.samples.length > 1);
        assert.ok(well.samples.length <= 1_200);

        for (const [index, sample] of well.samples.entries()) {
            assert.ok(Number.isFinite(sample.depth));
            if (index > 0) {
                assert.ok(sample.depth > well.samples[index - 1].depth);
            }
            for (const value of Object.values(sample.values)) {
                assert.ok(Number.isFinite(value));
            }
        }
    }
});

test("通道语义来自原表，N参1不伪造电阻率", () => {
    assert.deepEqual(
        getAquiferWellLog("N参1")?.channels.map(({ id, sourceLabel }) => ({
            id,
            sourceLabel,
        })),
        [
            { id: "naturalEncoded", sourceLabel: "自然加码" },
            { id: "sp", sourceLabel: "自然电位" },
            { id: "compensatedDensity", sourceLabel: "补偿密度" },
            { id: "compensatedAcoustic", sourceLabel: "补偿声波" },
        ],
    );
    assert.equal(
        getAquiferWellLog("N参1")?.channels.some(({ id }) => id === "resistivity"),
        false,
    );

    for (const wellId of EXPECTED_WELL_IDS.filter((id) => id !== "N参1")) {
        assert.deepEqual(
            getAquiferWellLog(wellId)?.channels.map(({ id }) => id),
            ["sp", "resistivity"],
        );
    }
});

test("摘要和每井元数据明确区分原始点与可视化抽样", () => {
    assert.deepEqual(AQUIFER_LOG_DATASET_SUMMARY, {
        wellCount: 8,
        originalSampleCount: 93_048,
        visualizationSampleCount: 9_600,
        maxVisualizationSamplesPerWell: 1_200,
        samplesAreVisualizationSubset: true,
    });

    for (const well of AQUIFER_WELL_LOGS) {
        assert.equal(well.isVisualizationSampled, true);
        assert.ok(well.originalSampleCount > well.samples.length);
        for (const channel of well.channels) {
            assert.equal(
                channel.validSampleCount + channel.missingSampleCount,
                well.originalSampleCount,
            );
        }
    }
});

test("代表井保留精确首尾、范围、有效数和来源声明", () => {
    const nCan1 = getAquiferWellLog("N参1");
    assert.ok(nCan1);
    assert.deepEqual(nCan1.sourceDepthRange, { minimum: 2810, maximum: 3800 });
    assert.deepEqual(nCan1.declaredDepthRange, { minimum: 2810, maximum: 3320 });
    assert.equal(nCan1.originalSampleCount, 7_921);
    assert.equal(nCan1.samples[0].depth, 2810);
    assert.equal(nCan1.samples.at(-1)?.depth, 3800);
    assert.equal(nCan1.channels.find(({ id }) => id === "sp")?.validSampleCount, 7_891);

    const su80 = getAquiferWellLog("苏80");
    assert.ok(su80);
    assert.deepEqual(su80.sourceDepthRange, { minimum: 30, maximum: 2530 });
    assert.equal(su80.originalSampleCount, 20_001);
    assert.equal(su80.samples[0].depth, 30);
    assert.equal(su80.samples.at(-1)?.depth, 2530);

    const yang3 = getAquiferWellLog("洋3");
    assert.ok(yang3);
    assert.equal(yang3.source.workbookName, "华洋3.xlsx");
    assert.deepEqual(yang3.sourceDepthRange, { minimum: 70, maximum: 1160 });
    assert.equal(yang3.originalSampleCount, 8_721);
});

test("按井 ID 查询稳定返回同一对象，未知 ID 返回 undefined", () => {
    assert.equal(getAquiferWellLog("苏118"), getAquiferWellLog("苏118"));
    assert.equal(getAquiferWellLog("不存在"), undefined);
});
