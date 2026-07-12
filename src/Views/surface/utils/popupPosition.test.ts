import assert from "node:assert/strict";
import test from "node:test";

import {
    calculatePopupPosition,
    clampPopupPosition,
} from "./popupPosition.ts";

test("弹窗在右下边缘时被限制在可视区域", () => {
    assert.deepEqual(
        calculatePopupPosition(
            { x: 980, y: 780 },
            { width: 1000, height: 800 },
            { width: 340, height: 380 },
        ),
        { left: 648, top: 408 },
    );
});

test("弹窗在画布外侧时至少保留安全边距", () => {
    assert.deepEqual(
        calculatePopupPosition(
            { x: -20, y: -20 },
            { width: 1000, height: 800 },
            { width: 280, height: 220 },
        ),
        { left: 12, top: 12 },
    );
});

test("拖拽后的弹窗位置会被限制在可视区域内", () => {
    assert.deepEqual(
        clampPopupPosition(
            { x: 900, y: 700 },
            { width: 1000, height: 800 },
            { width: 340, height: 380 },
        ),
        { left: 648, top: 408 },
    );
    assert.deepEqual(
        clampPopupPosition(
            { x: -40, y: -30 },
            { width: 1000, height: 800 },
            { width: 280, height: 220 },
        ),
        { left: 12, top: 12 },
    );
});
