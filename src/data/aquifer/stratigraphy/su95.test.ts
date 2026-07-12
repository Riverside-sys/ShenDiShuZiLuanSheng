import assert from "node:assert/strict";
import test from "node:test";

import {
    SU95_STRATIGRAPHY,
    SU95_STRATIGRAPHY_SUMMARY,
    findSu95LayerAtDepth,
} from "./index.ts";

test("包含工作簿中的全部 695 条苏95真实分层", () => {
    assert.equal(SU95_STRATIGRAPHY.length, 695);
    assert.equal(SU95_STRATIGRAPHY[0]?.sourceRow, 2);
    assert.equal(SU95_STRATIGRAPHY.at(-1)?.sourceRow, 696);
    assert.ok(SU95_STRATIGRAPHY.every((layer) => layer.wellId === "苏95"));
});

test("分层按深度排序且准确保留源数据中的 16 处间断", () => {
    let gapCount = 0;
    let totalGapThickness = 0;

    for (const [index, layer] of SU95_STRATIGRAPHY.entries()) {
        assert.ok(layer.topDepth < layer.bottomDepth);
        assert.equal(layer.thickness, layer.bottomDepth - layer.topDepth);

        const nextLayer = SU95_STRATIGRAPHY[index + 1];
        if (!nextLayer) {
            continue;
        }

        assert.ok(layer.topDepth < nextLayer.topDepth);
        assert.ok(layer.bottomDepth <= nextLayer.topDepth);
        const gapThickness = nextLayer.topDepth - layer.bottomDepth;
        if (gapThickness > 0) {
            gapCount += 1;
            totalGapThickness += gapThickness;
        }
    }

    assert.equal(gapCount, 16);
    assert.equal(totalGapThickness, 14);
});

test("代表层位精确匹配工作簿中的实际字段", () => {
    assert.deepEqual(SU95_STRATIGRAPHY[0], {
        sourceRow: 2,
        wellId: "苏95",
        topDepth: 0,
        bottomDepth: 25,
        thickness: 25,
        description: "棕红色粉砂质粘土",
        color: "棕红色",
        lithology: "粉砂质粘土",
        sourceSectionCode: "Q",
    });
    assert.deepEqual(SU95_STRATIGRAPHY[300], {
        sourceRow: 302,
        wellId: "苏95",
        topDepth: 1766,
        bottomDepth: 1770.5,
        thickness: 4.5,
        description: "蓝色泥岩",
        color: "蓝色",
        lithology: "泥岩",
        sourceSectionCode: "E1f3",
    });
    assert.deepEqual(SU95_STRATIGRAPHY.at(-1), {
        sourceRow: 696,
        wellId: "苏95",
        topDepth: 3037,
        bottomDepth: 3040,
        thickness: 3,
        description: "黄色砂砾岩",
        color: "黄色",
        lithology: "砂砾岩",
        sourceSectionCode: "S2f",
    });
});

test("摘要准确反映深度、厚度、间断和岩性类别计数", () => {
    assert.deepEqual(SU95_STRATIGRAPHY_SUMMARY, {
        totalLayers: 695,
        depthRange: {
            minimum: 0,
            maximum: 3040,
        },
        totalThickness: 3026,
        depthGapCount: 16,
        totalGapThickness: 14,
        lithologyCounts: {
            油页岩: 14,
            泥岩: 260,
            泥灰岩: 3,
            泥质粉砂岩: 51,
            玄武岩: 3,
            砂岩: 16,
            砂砾岩: 93,
            粉砂岩: 32,
            粉砂质泥岩: 3,
            粉砂质粘土: 11,
            粗砂岩: 1,
            粘土: 71,
            细砂岩: 97,
            软泥岩: 40,
        },
    });
});

test("深度查询采用左闭右开区间且仅在最终孔底包含右边界", () => {
    assert.equal(findSu95LayerAtDepth(-0.1), undefined);
    assert.equal(findSu95LayerAtDepth(0)?.sourceRow, 2);
    assert.equal(findSu95LayerAtDepth(24.999)?.sourceRow, 2);
    assert.equal(findSu95LayerAtDepth(25)?.sourceRow, 3);
    assert.equal(findSu95LayerAtDepth(70)?.sourceRow, 4);
    assert.equal(findSu95LayerAtDepth(3040)?.sourceRow, 696);
    assert.equal(findSu95LayerAtDepth(3040.1), undefined);
});

test("深度查询不会把源数据的间断误归入相邻层位", () => {
    assert.equal(findSu95LayerAtDepth(876.999)?.bottomDepth, 877);
    assert.equal(findSu95LayerAtDepth(877), undefined);
    assert.equal(findSu95LayerAtDepth(877.5), undefined);
    assert.equal(findSu95LayerAtDepth(878)?.topDepth, 878);
});
