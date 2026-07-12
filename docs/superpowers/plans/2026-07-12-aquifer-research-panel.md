# 含水层真实测井与岩性面板实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立“地图选井 → 查看真实测井曲线/苏95岩性柱”的首个研究数据闭环。

**Architecture:** 原始 XLSX 由可复现 Python 脚本转换为只读 TypeScript 数据模块；地图井卡片仅负责选井，独立的研究侧栏负责 ECharts 曲线与岩性柱展示。展示层明确区分原始记录数与可视化抽样，不插值、不生成不存在的物性。

**Tech Stack:** Vue 3、TypeScript、ECharts、Node Test Runner、Python/openpyxl

---

### Task 1: 八井测井数据

- [x] 核查 8 个工作簿的工作表、通道、深度范围和缺失数据。
- [x] 生成每井最多 1200 点的确定性真实数据子集，并保留完整统计。
- [x] 提供查询函数、类型、来源说明和测试。

### Task 2: 苏95岩性分层

- [x] 核查苏95工作簿实际字段与空列。
- [x] 生成 695 条单井分层、摘要和按深度查询函数。
- [x] 保留 16 处原始深度间断，不生成孔隙度或渗透率。

### Task 3: 研究资料侧栏

**Files:**
- Create: `src/Views/surface/components/AquiferWellResearchPanel.vue`
- Create: `src/Views/surface/utils/aquiferResearchPresentation.ts`
- Test: `src/Views/surface/utils/aquiferResearchPresentation.test.ts`
- Modify: `src/Views/surface/index.vue`

- [x] 先写展示模型测试，覆盖普通测井井、N参1特殊通道、苏95岩性及无可视资料井。
- [x] 实现面板展示模型与通道名称/颜色。
- [x] 实现测井曲线页签：深度纵轴、真实通道横轴、缺失值断线。
- [x] 实现苏95岩性柱页签：按真实厚度显示 695 层，支持缩放与悬停详情。
- [x] 从井位档案打开面板；切换井、场景和重置时关闭。
- [x] 明确标注“曲线为可视化抽样”“苏95仅代表单井”“无真实动态水位数据”。

### Task 4: 验证

- [x] 运行全部含水层测试和测试类型检查。
- [x] 运行生产构建。
- [x] 浏览器验证阜3、N参1、苏95及无结构化数据井。
- [x] 独立代码审查后交付。
