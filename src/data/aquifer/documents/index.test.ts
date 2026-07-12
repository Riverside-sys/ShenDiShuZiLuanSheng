import assert from "node:assert/strict";
import test from "node:test";

import {
    AQUIFER_WELL_DOCUMENTS,
    getAquiferWellDocument,
} from "./index.ts";

test("洋3与三口柱状图井提供可预览文档", () => {
    assert.equal(AQUIFER_WELL_DOCUMENTS.length, 4);
    assert.deepEqual(
        AQUIFER_WELL_DOCUMENTS.map((document) => document.wellId).sort(),
        ["ZK5", "ZK6", "洋3", "石4井"],
    );
    assert.equal(getAquiferWellDocument("苏80"), undefined);
});

test("洋3井提供可预览的原始剖面扫描图", () => {
    assert.deepEqual(getAquiferWellDocument("洋3"), {
        wellId: "洋3",
        title: "洋3井原始手剖面扫描",
        url: "/aquifer/documents/yang3-section.jpg",
        actionLabel: "查看原始剖面图",
        sourceNote:
            "来源：吉大资料「华洋3井.jpg」网页预览版（宽度已压缩，可滚动查看）",
    });
});

test("石4井、ZK5、ZK6 提供综合柱状图预览", () => {
    assert.deepEqual(getAquiferWellDocument("石4井"), {
        wellId: "石4井",
        title: "石4井地层综合柱状图",
        url: "/aquifer/documents/shi4-column.jpg",
        actionLabel: "查看综合柱状图",
        sourceNote:
            "来源：吉大资料 DWG 柱状图网页预览版（由 ODA→DXF→栅格导出，可滚动查看）",
    });
    assert.equal(
        getAquiferWellDocument("ZK5")?.url,
        "/aquifer/documents/zk5-column.jpg",
    );
    assert.equal(getAquiferWellDocument("ZK5")?.actionLabel, "查看综合柱状图");
    assert.equal(
        getAquiferWellDocument("ZK6")?.url,
        "/aquifer/documents/zk6-column.jpg",
    );
});
