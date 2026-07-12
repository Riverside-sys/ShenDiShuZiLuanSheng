import assert from "node:assert/strict";
import test from "node:test";

import {
    getAquiferWellIdFromPicked,
    isAquiferDepthEnvelopePicked,
    resolveAquiferWellSceneHover,
} from "./aquiferWellPick.ts";

test("从 marker / stick 实体 id 解析井号", () => {
    assert.equal(
        getAquiferWellIdFromPicked({
            id: { id: "aquifer-well-marker-苏80" },
        }),
        "苏80",
    );
    assert.equal(
        getAquiferWellIdFromPicked({
            id: { id: "aquifer-well-stick-N参1" },
        }),
        "N参1",
    );
    assert.equal(
        getAquiferWellIdFromPicked({
            id: { id: "some-other-entity" },
        }),
        null,
    );
});

test("优先读取 properties.aquiferWellId", () => {
    assert.equal(
        getAquiferWellIdFromPicked({
            id: {
                id: "ignored",
                properties: {
                    aquiferWellId: {
                        getValue: () => "洋3",
                    },
                },
            },
        }),
        "洋3",
    );
});

test("识别深度包络实体", () => {
    assert.equal(
        isAquiferDepthEnvelopePicked({
            id: { id: "aquifer-depth-envelope" },
        }),
        true,
    );
    assert.equal(
        isAquiferDepthEnvelopePicked({
            id: {
                id: "x",
                properties: {
                    aquiferDepthEnvelope: { getValue: () => true },
                },
            },
        }),
        true,
    );
    assert.equal(
        isAquiferDepthEnvelopePicked({
            id: { id: "aquifer-well-marker-苏80" },
        }),
        false,
    );
});

test("drillPick 结果中井优先于包络", () => {
    assert.deepEqual(
        resolveAquiferWellSceneHover([
            { id: { id: "aquifer-depth-envelope" } },
            { id: { id: "aquifer-well-stick-苏80" } },
        ]),
        { wellId: "苏80", onEnvelope: false },
    );
});

test("仅命中包络时标记 onEnvelope", () => {
    assert.deepEqual(
        resolveAquiferWellSceneHover([
            { id: { id: "aquifer-depth-envelope" } },
        ]),
        { wellId: null, onEnvelope: true },
    );
});

test("空拾取结果返回空悬停", () => {
    assert.deepEqual(resolveAquiferWellSceneHover([]), {
        wellId: null,
        onEnvelope: false,
    });
});
