# Surface 含水层井位上图实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `surface` 含水层场景显示 37 口真实井位，并自动飞到井网范围。

**Architecture:** 由纯函数把共享井数据转换为 GeoJSON，`surface/index.vue` 只负责 Cesium 数据源生命周期和视觉样式。保留现有重点测线 KML，井位作为独立数据源叠加；本任务不实现井位弹窗和跨场景井 ID 联动。

**Tech Stack:** Vue 3、Cesium、TypeScript、Node Test Runner

---

### Task 1: 井数据转换

**Files:**
- Create: `src/Views/surface/utils/aquiferWells.ts`
- Create: `src/Views/surface/utils/aquiferWells.test.ts`

- [x] 先写失败测试：验证输出为 37 个 Point Feature，并完整保留井 ID、坐标、元数据及资料标记。
- [x] 实现 `createAquiferWellGeoJson()`。
- [x] 运行测试并确认通过。

### Task 2: Cesium 井位图层

**Files:**
- Modify: `src/Views/surface/index.vue`

- [x] 含水层场景同时加载原测线 KML和井位 GeoJSON。
- [x] 有研究资料的井与仅坐标井使用不同点样式。
- [x] 添加简洁图例，显示两类井的数量。
- [x] 相机飞到井位数据源范围；更新含水层漫游中心到真实苏北井网。
- [x] 场景切换、区域重置和组件卸载时释放井位数据源。

### Task 3: 验证并停止

- [x] 运行井位转换测试。
- [x] 运行测试项目类型检查与 `pnpm build`。
- [x] 浏览器验证 37 个井点、图例、相机范围及场景切换清理行为。
- [x] 停止并交付用户审核，不实现弹窗或井 ID 跳转。
