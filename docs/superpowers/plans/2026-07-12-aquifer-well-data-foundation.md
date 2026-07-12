# 含水层共享井数据基础实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将吉大资料中的 37 口井转换为 `surface` 与 `hanshuiceng` 可共同使用、可追溯且经过校验的 TypeScript 数据。

**Architecture:** 在 `src/data/aquifer/` 建立与场景无关的共享数据模块。坐标以“苏北盆地收集钻孔坐标校正后.xlsx”的 WGS84/CGCS2000 字段为准，井别、完井日期和地区来自旧坐标表，仅通过井号关联；资料可用性以实际文件清单标记。

**Tech Stack:** TypeScript、Vue 3、Vite、Python/openpyxl（仅用于一次性数据核对）

---

### Task 1: 定义共享井数据模型

**Files:**
- Create: `src/data/aquifer/types.ts`
- Create: `src/data/aquifer/wells.ts`
- Create: `src/data/aquifer/index.ts`

- [x] **Step 1: 定义稳定字段**

定义井 ID、WGS84 坐标、CGCS2000 坐标、可选元数据和资料类型。使用 `readonly`，防止场景组件直接修改原始数据。

- [x] **Step 2: 写入 37 口井的标准化记录**

将度分秒转换为十进制度；将 `1976.0525` 一类日期转换为 `1976-05-25`；缺失元数据保留为未定义，不猜测。

- [x] **Step 3: 标记资料可用性**

资料类型固定为：

```ts
type AquiferWellResourceType =
  | "structured-log"
  | "grapher-project"
  | "stratigraphy"
  | "column-diagram"
  | "scanned-document";
```

- [x] **Step 4: 提供查询入口**

导出完整井数组、按 ID 查询函数、包含结构化测井的井集合及数据集摘要。

### Task 2: 校验数据

**Files:**
- Validate: `src/data/aquifer/wells.ts`

- [x] **Step 1: 执行静态数据校验**

验证 37 个唯一井 ID、经纬度合法、CGCS2000 坐标为有限数值、8 口结构化测井井、1 口岩性井和 3 口柱状图井。

- [x] **Step 2: 执行项目构建**

Run: `pnpm build`

Expected: TypeScript 类型检查通过；若项目原有问题导致失败，明确区分新引入问题和既有问题。

- [x] **Step 3: 停止并交付审核**

只总结数据文件、校验结果和已知缺失；不修改 `surface` 或 `hanshuiceng` UI，等待用户批准下一小任务。
