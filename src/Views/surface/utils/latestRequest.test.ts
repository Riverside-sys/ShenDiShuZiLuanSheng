import assert from "node:assert/strict";
import test from "node:test";

import { createLatestRequestGuard } from "./latestRequest.ts";

test("开始新请求后旧请求立即失效", () => {
    const guard = createLatestRequestGuard();
    const firstRequestIsCurrent = guard.begin();
    const secondRequestIsCurrent = guard.begin();

    assert.equal(firstRequestIsCurrent(), false);
    assert.equal(secondRequestIsCurrent(), true);
});

test("主动失效后当前请求不可再提交结果", () => {
    const guard = createLatestRequestGuard();
    const requestIsCurrent = guard.begin();

    guard.invalidate();

    assert.equal(requestIsCurrent(), false);
});
