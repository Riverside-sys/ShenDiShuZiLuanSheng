import assert from "node:assert/strict";
import test from "node:test";

import {
    AQUIFER_WELL_SCENE_SUMMARY,
    buildAquiferWellSceneGeometry,
} from "./wellSceneGeometry.ts";

test("井网示意几何包含全部校正井位与有深度井柱", () => {
    const geometry = buildAquiferWellSceneGeometry();

    assert.equal(geometry.surfaceMarkers.length, 37);
    assert.ok(geometry.wellSticks.length >= 8);
    assert.ok(geometry.wellSticks.every((stick) => stick.bottomDepth > stick.topDepth));
    assert.ok(geometry.depthEnvelope.polygon.length >= 3);
    assert.ok(
        geometry.depthEnvelope.bottomDepth > geometry.depthEnvelope.topDepth,
    );
    assert.match(geometry.disclaimer, /示意/);
});

test("摘要与几何一致且排除深部孤立井对包络顶面的污染", () => {
    const geometry = buildAquiferWellSceneGeometry();

    assert.equal(AQUIFER_WELL_SCENE_SUMMARY.totalWells, 37);
    assert.equal(
        AQUIFER_WELL_SCENE_SUMMARY.wellsWithDepthSticks,
        geometry.wellSticks.length,
    );
    assert.equal(
        AQUIFER_WELL_SCENE_SUMMARY.envelopeVertexCount,
        geometry.depthEnvelope.polygon.length,
    );

    // N参1 测井从 2810m 才开始，不应把包络顶面拉到深部。
    assert.ok(geometry.depthEnvelope.topDepth < 500);
    assert.ok(
        geometry.wellSticks.some((stick) => stick.wellId === "N参1"),
    );
});

test("包络多边形按经度排序后首尾不重复，便于 Cesium 闭合", () => {
    const { polygon } = buildAquiferWellSceneGeometry().depthEnvelope;
    const first = polygon[0];
    const last = polygon[polygon.length - 1];
    assert.notDeepEqual(first, last);
    assert.ok(polygon.every((point) => Number.isFinite(point.longitude)));
});
