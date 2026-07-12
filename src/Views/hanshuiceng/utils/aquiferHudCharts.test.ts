import assert from "node:assert/strict";
import test from "node:test";

import { createAquiferHudChartModel } from "./aquiferHudCharts.ts";

test("地下 HUD 图表模型来自真实井网、测井和苏95岩性", () => {
    const model = createAquiferHudChartModel();

    assert.equal(model.wellDepthSpans.length, 8);
    assert.equal(model.wellDepthSpans[0]?.wellId, "苏80");
    assert.deepEqual(
        model.wellDepthSpans.find((well) => well.wellId === "N参1"),
        {
            wellId: "N参1",
            minimum: 2810,
            maximum: 3800,
            span: 990,
        },
    );

    assert.equal(model.lithologyShares.length, 14);
    assert.equal(model.lithologyShares[0]?.name, "泥岩");
    assert.equal(model.lithologyShares[0]?.count, 260);

    assert.deepEqual(model.summaryCards.map(({ label }) => label), [
        "校正井位",
        "结构化测井",
        "测井原始点",
        "苏95分层",
    ]);
});
