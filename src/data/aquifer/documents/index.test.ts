import assert from "node:assert/strict";
import test from "node:test";

import {
    AQUIFER_WELL_DOCUMENTS,
    getAquiferWellDocument,
} from "./index.ts";

test("洋3井提供可预览的原始剖面扫描图", () => {
    assert.equal(AQUIFER_WELL_DOCUMENTS.length, 1);
    assert.deepEqual(getAquiferWellDocument("洋3"), {
        wellId: "洋3",
        title: "洋3井原始手剖面扫描",
        url: "/aquifer/documents/yang3-section.jpg",
        sourceNote:
            "来源：吉大资料「华洋3井.jpg」网页预览版（宽度已压缩，可滚动查看）",
    });
    assert.equal(getAquiferWellDocument("苏80"), undefined);
});
