import assert from "node:assert/strict";
import test from "node:test";

import { AQUIFER_WELLS } from "../../../data/aquifer/wells.ts";
import { createAquiferResearchPresentation } from "./aquiferResearchPresentation.ts";
import { createAquiferWellPresentation } from "./aquiferWellPresentation.ts";

test("普通测井井生成 SP 与电阻率双通道展示模型", () => {
    const presentation = createAquiferResearchPresentation("阜3");

    assert.ok(presentation?.log);
    assert.deepEqual(presentation.availableTabs, ["log"]);
    assert.equal(presentation.log.originalSampleCount, 9_361);
    assert.equal(presentation.log.visualizationSampleCount, 1_200);
    assert.deepEqual(
        presentation.log.channels.map(({ id, label }) => ({ id, label })),
        [
            { id: "sp", label: "自然电位" },
            { id: "resistivity", label: "电阻率" },
        ],
    );
    assert.equal(presentation.log.channels[0].points[0]?.[1], 30);
    assert.equal(presentation.log.channels[0].points.at(-1)?.[1], 1200);
});

test("N参1严格展示四个真实通道且不伪造电阻率", () => {
    const presentation = createAquiferResearchPresentation("N参1");

    assert.deepEqual(
        presentation?.log?.channels.map(({ id }) => id),
        [
            "naturalEncoded",
            "sp",
            "compensatedDensity",
            "compensatedAcoustic",
        ],
    );
    assert.equal(
        presentation?.log?.channels.some(({ id }) => id === "resistivity"),
        false,
    );
    assert.deepEqual(presentation?.log?.sourceDepthRange, {
        minimum: 2810,
        maximum: 3800,
    });
    assert.deepEqual(presentation?.log?.declaredDepthRange, {
        minimum: 2810,
        maximum: 3320,
    });
});

test("苏95生成695层单井岩性展示模型", () => {
    const presentation = createAquiferResearchPresentation("苏95");

    assert.deepEqual(presentation?.availableTabs, ["stratigraphy"]);
    assert.equal(presentation?.stratigraphy?.layers.length, 695);
    assert.equal(presentation?.stratigraphy?.summary.totalLayers, 695);
    assert.equal(presentation?.stratigraphy?.singleWellOnly, true);
});

test("没有结构化曲线或岩性资料的井不生成研究面板", () => {
    assert.equal(createAquiferResearchPresentation("苏83"), undefined);
    assert.equal(createAquiferResearchPresentation("不存在"), undefined);
});

test("井位卡片入口与实际可展示数据保持一致", () => {
    for (const well of AQUIFER_WELLS) {
        assert.equal(
            createAquiferWellPresentation(well).hasInteractiveResearchData,
            createAquiferResearchPresentation(well.id) !== undefined,
            `${well.id} 的入口声明与实际数据不一致`,
        );
    }
});
