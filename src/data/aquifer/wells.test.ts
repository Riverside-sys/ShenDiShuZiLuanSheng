import assert from "node:assert/strict";
import test from "node:test";

import {
    AQUIFER_WELL_DATASET_SUMMARY,
    AQUIFER_WELLS,
    AQUIFER_WELLS_WITH_STRUCTURED_LOG,
    findAquiferWellById,
} from "./wells.ts";
import type { AquiferWellResourceType } from "./types.ts";

test("包含 37 个井号唯一的校正井位", () => {
    assert.equal(AQUIFER_WELLS.length, 37);
    assert.equal(new Set(AQUIFER_WELLS.map((well) => well.id)).size, 37);
});

test("所有井位坐标均位于资料覆盖的苏北区域", () => {
    for (const well of AQUIFER_WELLS) {
        assert.ok(Number.isFinite(well.longitude));
        assert.ok(Number.isFinite(well.latitude));
        assert.ok(well.longitude >= 119 && well.longitude <= 121);
        assert.ok(well.latitude >= 33 && well.latitude <= 35);
        assert.ok(Number.isFinite(well.cgcs2000.northing));
        assert.ok(Number.isFinite(well.cgcs2000.easting));
    }
});

test("资料可用性摘要与原始文件清单一致", () => {
    assert.deepEqual(AQUIFER_WELL_DATASET_SUMMARY, {
        total: 37,
        withMetadata: 27,
        withStructuredLog: 8,
        withGrapherProject: 7,
        withStratigraphy: 1,
        withColumnDiagram: 3,
        withScannedDocument: 2,
    });
});

test("资料标签绑定到确切井号且派生集合不可修改", () => {
    const idsWithResource = (resource: AquiferWellResourceType) =>
        AQUIFER_WELLS.filter((well) => well.resources.includes(resource))
            .map((well) => well.id)
            .sort();

    assert.deepEqual(idsWithResource("structured-log"), [
        "N参1", "新3", "洋3", "涟1", "苏107", "苏118", "苏80", "阜3",
    ].sort());
    assert.deepEqual(idsWithResource("grapher-project"), [
        "N参1", "涟1", "涟2", "苏107", "苏118", "苏80", "阜3",
    ].sort());
    assert.deepEqual(idsWithResource("stratigraphy"), ["苏95"]);
    assert.deepEqual(idsWithResource("column-diagram"), ["ZK5", "ZK6", "石4井"]);
    assert.deepEqual(idsWithResource("scanned-document"), ["洋3", "苏83"].sort());
    assert.equal(Object.isFrozen(AQUIFER_WELLS_WITH_STRUCTURED_LOG), true);
});

test("代表性井的精确坐标和日期保持不变", () => {
    assert.deepEqual(findAquiferWellById("苏80"), {
        id: "苏80",
        name: "苏80",
        longitude: 119.39883213,
        latitude: 33.72235383,
        cgcs2000: { northing: 3733027.248, easting: 444280.798 },
        wellType: "预探井",
        completionDate: "1976-08-26",
        region: "涟水",
        resources: ["structured-log", "grapher-project"],
    });
    assert.equal(findAquiferWellById("滨1")?.completionDate, "1958-07-10");
    assert.equal(findAquiferWellById("阜2")?.completionDate, "1958-09-30");
    assert.equal(findAquiferWellById("N参1")?.wellType, undefined);
});

test("可以按井 ID 查询且未知井返回 undefined", () => {
    assert.equal(findAquiferWellById("苏80")?.name, "苏80");
    assert.equal(findAquiferWellById("不存在"), undefined);
});
