# 实习产出总结（三）：TTFE 线上问题台账平台化建设

## 一、项目概述

### 1. 背景

TTFE 线上问题原先主要维护在两套飞书多维表格中：线上问题 Base 用于汇总已召回报警和人工补录的未召回问题，Fatal Base 用于维护 Fatal 事故及其治理字段。两套数据源同时存在以下问题：

- 已召回问题来自 `radar_ticket` 定时同步，未召回问题和 Fatal 信息依赖人工维护，数据链路分散；
- Fatal 与对应 Radar 工单缺少稳定关联，列表展示和召回率统计容易重复计数；
- 多维表格适合临时展示和人工补充，但不适合作为长期可编辑、可统计、可联动的业务事实源；
- 字段口径、编辑权限和统计规则没有统一的前后端契约，长期演进容易出现数据含义漂移；
- Fatal 历史表包含大量长尾字段，如果机械复制全部字段，会使数据库和页面快速膨胀。

因此，需要将线上问题治理从“飞书 Base 半自动维护”迁移为“ReliableBackend 数据库 + Platform/Flinx 页面 + Aime Agent 增量治理”的平台化模式：由 Aime 定时从 Bits 发现新增 Fatal，在飞书群内发起人工确认，再根据确认结果和入库规则调用 RB 接口，形成 Human-in-the-loop 的事故治理流程。

### 2. 工作目标

我的目标是建立统一、可持续维护的 TTFE 线上问题台账：保留 `radar_ticket` 作为报警工单事实源，新增业务表承接 Fatal、人工未召回和 Radar 补充治理字段，通过统一接口向前端输出同一种数据结构，并在 Platform/Flinx 提供查询、筛选、新增、编辑、删除和 Fatal 状态确认能力。同时将 Aime 从单纯的定时机器人扩展为事故治理 Agent，负责 Fatal 发现、卡片交互、规则决策和入库工具调用。

最终形成以下治理链路：

```text
Bits 定时拉取 Fatal
  -> Aime 解析并识别新增事故
  -> 飞书群发送交互卡片
  -> 人工确认召回状态、关联工单
  -> Aime 执行规则校验与幂等判断
  -> 调用 RB Fatal 创建工具
  -> 写入 web_incident_record
  -> Platform/Flinx 持续维护治理字段
```

## 二、我的主要工作

### 1. 梳理线上问题数据主线与系统职责

我首先梳理了三类数据的事实来源和维护边界：

| 数据来源 | 承载内容 | 长期定位 |
| --- | --- | --- |
| `radar_ticket` | 报警系统产生的已召回工单、报警事实字段和人工分诊字段 | 保持报警工单事实源，不承载独立 Fatal 数据 |
| `web_incident_record` | Fatal、人工未召回记录，以及 Radar 缺失的治理维度 | 新增的线上问题业务事实源 |
| Aime + Bits | 每日发现增量 Fatal，提供 Fatal ID、链接、标题、级别和发生时间 | Fatal 增量入口，治理字段后续在 Platform/Flinx 补充 |

在此基础上，我明确了“数据归谁保存、哪个字段可编辑、关联后如何展示、统计时如何去重”等关键规则，避免前端、后端和机器人链路各自维护一套口径。

### 2. 设计 Aime Human-in-the-loop Agent 工作流

我将 Fatal 增量治理抽象为一套带人工决策门禁的 Agent 工作流。Aime 不直接替代业务人员判断事故是否被报警召回，而是负责串联数据获取、信息抽取、交互确认、规则校验和系统写入，让 AI/Agent 承担确定性高、重复度高的执行工作，将业务事实判断保留给人。

工作流划分为以下状态：

```text
DISCOVERED（Bits 发现）
  -> CARD_PENDING（等待飞书卡片确认）
  -> HUMAN_CONFIRMED（人工提交召回结论）
  -> VALIDATED（Aime 完成字段与规则校验）
  -> PERSISTED / SKIPPED / RETRY（入库 / 跳过 / 重试）
```

具体编排如下：

1. **定时触发**：Aime 每天调用 Bits DataMart 能力拉取 TTFE Fatal，解析 `fatal_id`、`fatal_link`、标题、事故等级和发生时间；
2. **增量识别**：以 `fatal_id` 作为稳定身份，与已处理集合或 RB 查询结果做差集，只为新增 Fatal 启动工作流；
3. **卡片生成**：在飞书群发送交互卡片，自动填充 Bits 已知字段，并要求业务人员确认召回状态；已召回时同时填写关联的 Radar 工单 ID；
4. **人工门禁**：召回状态属于业务事实，必须由人确认。Agent 不使用大模型猜测召回结论，避免自动化误判污染台账；
5. **规则决策**：Aime 校验 Fatal 链接与 ID 是否一致、已召回记录是否关联工单、必填字段是否完整，以及该 Fatal 是否已经入库；
6. **工具调用**：满足条件后调用 `POST /api/web/online-issue/fatal/create`，由 RB 完成最终字段校验和幂等写入；不满足条件时不入库，并通过卡片提示补充信息；
7. **结果回写**：将“创建成功、已存在、校验失败或等待重试”等结果回写飞书卡片或群消息，使处理状态可观察、可追踪。

这套设计本质上是“LLM/Agent 编排 + 确定性规则 + Human-in-the-loop + 后端工具”的组合：模型可用于理解卡片上下文、生成摘要和解释错误，真正影响数据的召回结论、字段校验和入库操作则由人工确认与确定性代码控制。

为便于后续复用，我进一步将流程抽象为 `fatal-governance` 示例 Skill。该示例已包含标准 `SKILL.md`、工作流与 Tool 契约、面试讲解材料及可运行的确定性决策校验脚本；真实 Bits/Lark/RB Tool 适配和生产发布仍属于后续接入范围：

| Skill 要素 | 设计 |
| --- | --- |
| 触发条件 | 定时扫描发现新 Fatal，或人工要求处理指定 Fatal |
| 输入 | Bits Fatal 五元组、飞书卡片确认结果、可选 Radar 工单 ID |
| Tools | `fetch_fatals`、`send_review_card`、`validate_decision`、`create_fatal_record`、`query_record_status` |
| 决策规则 | 人工决定召回状态；Agent 判断字段完整性、关联约束、幂等状态和是否允许入库 |
| 安全门禁 | 无人工确认不执行入库；已召回但无关联工单不入库；重复 Fatal 不覆盖人工数据 |
| 输出 | `persisted / skipped / pending / retry` 状态、记录 ID和可读的失败原因 |
| 可观测性 | 记录 `fatal_id`、工作流状态、卡片消息 ID、接口结果和重试次数 |

### 3. 设计 `web_incident_record` 统一数据模型

我设计了 `web_incident_record` 表，用于承接非 `radar_ticket` 来源的线上问题。当前模型支持三种记录类型：

- `fatal`：Fatal 事故记录；
- `unrecalled`：人工维护的未召回线上问题；
- `supplement`：Radar 工单缺失治理字段时，由编辑流程自动创建的补充记录，不独立展示。

数据库设计没有机械复制 Fatal Base 的全部字段，而是采用“常用字段列化 + 长尾字段 JSON 化”的方式：

- 标题、发生时间、所属资产、召回状态、Fatal ID、Fatal 链接、事故等级等高频字段直接列化，支持筛选、关联和查询；
- `related_ticket_ids` 使用 JSON 数组关联一个或多个 Radar 工单，作为列表合并和统计去重依据；
- `fatal_extra_info` 分为 `online_issue_base` 和 `fatal_base` 两组，分别保存线上问题通用治理维度和 Fatal 专属长尾字段；
- 保存 `discover_time`、`ack_time`、`identified_time`、`mitigated_time`、`resolved_time` 等真实时间点，由后端派生发现、响应、定位、止损和 MTTR 时长；
- 历史 Fatal 只有时长而没有时间点时保留原始值，不反推不存在的时间点，避免制造伪数据。

这一设计兼顾了查询性能、页面可维护性和历史字段完整性，也为后续增加索引、统计和审计能力保留了扩展空间。

### 4. 开发后端统一查询与写入能力

我在 ReliableBackend 中完成了线上问题台账后端能力，将 `radar_ticket` 与 `web_incident_record` 映射为统一的 `OnlineIssueItem`，并落地以下 5 个接口：

| 接口 | 能力 |
| --- | --- |
| `POST /api/web/online-issue/ticket-list` | 合并查询 Radar、Fatal 和人工未召回记录，支持筛选、视图切分和分页 |
| `POST /api/web/online-issue/edit` | 根据字段事实源，将编辑分别写回 `radar_ticket` 或 `web_incident_record` |
| `POST /api/web/online-issue/create` | 创建人工未召回线上问题 |
| `POST /api/web/online-issue/fatal/create` | 创建 Fatal；默认进入待确认视图，并按 `fatal_id` 实现应用层幂等 |
| `POST /api/web/online-issue/delete` | 删除独立的未召回或 Fatal 记录，禁止删除 Radar 工单和 `supplement` |

统一读取链路包含以下关键处理：

1. 查询 `radar_ticket` 并按 `ticket_id` 去重，同一工单保留数据库 ID 最大的最新记录；
2. 查询 `web_incident_record`，兼容历史 JSON 结构并统一整理 `fatal_extra_info`；
3. 使用 `related_ticket_ids` 将 Fatal 或补充记录关联到 Radar 工单；
4. 已关联 Fatal 以 Radar 事实字段为主，同时挂载 Fatal 明细，合并为一行展示；
5. 未关联 Fatal 和人工未召回记录作为独立行展示，孤立的 `supplement` 不展示；
6. 合并后再执行筛选、视图切分和分页，保证筛选结果基于最终展示数据。

统一编辑链路采用事务保证原子性，并根据字段事实源拆分补丁：Radar 已有的事实字段写回 `radar_ticket`，Web 直接列写入 `web_incident_record`，通用治理维度写入 `fatal_extra_info.online_issue_base`，Fatal 专属字段写入 `fatal_extra_info.fatal_base`。当 Radar 行首次编辑数据库中不存在的治理字段时，后端会自动创建 `supplement` 记录，前端无需感知底层表差异。

### 5. 建立数据校验、幂等与防误操作机制

由于统一台账同时操作两张表和多种记录类型，我在后端补充了严格的边界控制：

- Fatal 创建时校验 `fatal_link` 中的事故 ID 与 `fatal_id` 一致；
- Fatal 默认写入 `unknown` 状态并进入“待确认 Fatal”视图，避免在未人工判断前误计入已召回或未召回；
- Fatal 状态改为 `recalled` 时必须至少关联一个 Radar 工单；
- 重复提交相同 `fatal_id` 时返回已有记录，不覆盖已经人工维护的内容；
- 新增未召回记录必须提供标题、发生时间和至少一个影响地区；
- 未知字段、只读字段、错误枚举和错误值类型统一返回字段级错误；
- 删除接口只接受正整数 Web 记录主键，永远不删除 `radar_ticket`，也禁止删除系统自动生成的 `supplement`；
- 写操作使用数据库事务，避免 Radar 与 Web 补充字段只成功一半。

### 6. 开发 Platform/Flinx 统一管理页面

我在 Platform 的 Reliability Issue 模块中完成了 TTFE 线上问题管理页面，使用同一套列表组件承载两个业务视图：

- **线上问题**：展示召回状态为 `recalled` 或 `unrecalled` 的记录；
- **待确认 Fatal 集合**：展示状态为 `unknown` 的 Fatal，人工确认后自动进入线上问题视图。

页面已实现的主要能力包括：

- 关键词、时间范围、影响地区、所属资产、是否 Fatal、报警级别、事故级别、召回状态、容灾结果、阴跌问题和季度等组合筛选；
- 筛选条件之间使用 AND，同一多选字段内部使用 OR，并支持“未填写”筛选；
- 筛选条件、视图和分页保存在 URL Query 中，支持刷新恢复和链接分享；
- 支持新增未召回问题和新增 Fatal；
- 支持表格行内编辑，并根据记录来源限制可编辑字段；
- 支持 Fatal 徽标和专用详情抽屉，集中展示事故来源、事故类型、事故原因及长尾治理字段；
- 支持确认 Fatal 召回状态、关联 Radar 工单、删除 Web 侧记录和主动刷新；
- 前端对接口响应进行运行时结构校验，并统一处理字段级错误和请求异常；
- 使用 React Query 管理请求状态和缓存，写入成功后自动失效并刷新列表。

### 7. 沉淀跨仓库接口契约

前后端分别位于 ReliableBackend 和 Portal Monorepo。为降低跨仓库联调成本，我整理了独立接口文档，明确：

- `OnlineIssueItem` 的统一字段结构和三态召回口径；
- Radar 行、独立 Web 行、被 Fatal 装饰的 Radar 行如何识别；
- `recordId`、`webRecordId` 和 `ticketId` 的类型差异及使用场景；
- 哪些字段可编辑、应写入哪张表、哪些字段必须只读；
- 新增、编辑、删除和 Fatal 幂等创建的请求及响应结构；
- HTTP 400、404、500 的错误语义和字段级错误格式；
- 最小联调路径及前端调用注意事项。

这份契约使前后端可以围绕同一数据语义并行开发，也避免了把 Radar 的字符串工单 ID 误当作 Web 数字主键删除等高风险问题。

## 三、技术方案与技术栈

| 维度 | 方案 |
| --- | --- |
| 前端语言与框架 | React 18、TypeScript 5、React Hooks |
| 前端组件与状态 | Arco Design、TanStack React Query、Day.js、SCSS Modules、URL Query 状态 |
| 后端框架 | TypeScript、Gulux、Sequelize |
| 数据存储 | MySQL；`radar_ticket` + `web_incident_record` 双事实源 |
| Agent 工作流 | Aime 定时触发、Bits 数据工具、飞书交互卡片、Human-in-the-loop 决策门禁、RB 入库工具 |
| Skill 抽象 | `fatal-governance` 示例 Skill：触发、工具、状态机、入库规则、失败重试、可观测性及确定性校验脚本 |
| 数据建模 | 高频字段列化；多选字段 JSON 数组；长尾治理字段分组写入 `fatal_extra_info` |
| 接口形态 | REST 风格 POST 接口；统一 DTO；字段级错误返回 |
| 一致性机制 | 数据库事务、字段事实源路由、Radar 去重、关联优先级、Fatal 应用层幂等 |
| 页面能力 | 双视图、服务端分页、组合筛选、行内编辑、Fatal 抽屉、新增与删除 |
| 测试方式 | 后端 Jest 服务测试；前端 API、URL 状态、筛选、创建、编辑和表格组件测试 |

## 四、关键设计成果

### 1. 统一数据口径

我没有把三类数据简单拼接，而是先统一记录身份、召回状态和字段含义。`recordSource` 负责标识展示行来源，`recordId` 和 `webRecordId` 负责定位 Web 记录，`ticketId` 负责定位 Radar 工单，`recallStatus` 使用 `recalled / unrecalled / unknown` 三态表达真实业务状态。

### 2. 关联去重而非重复展示

已召回 Fatal 如果关联了 Radar 工单，后端会将两条物理记录合并为一条展示记录：Radar 提供工单事实字段，Web 记录补充 Fatal 明细和治理维度。这样既保留两套事实源的职责边界，又避免同一个线上问题在列表和后续统计中被重复计算。

### 3. 兼容历史数据而不制造迁移成本

针对已经导入的历史 Fatal，我采用读取时分类与结构归一化：历史裸字段和旧 `unmapped_fields` 在读取时按白名单拆分到线上问题字段和 Fatal 抽屉，编辑后再收敛为标准的 `online_issue_base / fatal_base` 结构。该方案无需为了页面改造而立即重写全部历史数据。

### 4. 事实字段与治理字段分离

Radar 报警事实继续由 `radar_ticket` 维护，线上问题治理字段则由 `web_incident_record` 补充。通过自动创建 `supplement`，普通 Radar 工单也可以逐步获得业务、价值链、影响端、责任端和阴跌问题等治理维度，而不需要持续向原工单表增加大量专用列。

### 5. Agent 自动化与人工判断分层

我没有将 Agent 设计为可以任意修改数据的黑盒，而是将流程拆成三层：Aime 负责工作流编排和工具选择，确定性代码负责字段校验、幂等和写入，业务人员负责召回状态等高风险事实判断。这一分层既利用了 Agent 在跨系统编排和交互上的优势，也保证了事故台账的准确性与可审计性。

## 五、验证与当前进展

### 1. 已完成能力

| 模块 | 当前进展 |
| --- | --- |
| 数据库设计 | 完成 `web_incident_record` 字段、JSON 分组、关联关系和索引方案设计 |
| 数据模型 | ReliableBackend 已建立与 BOE 表结构对应的 Sequelize Model |
| 历史数据 | 数据库设计文档记录 BOE 已导入 98 条历史 Fatal，并通过 `unknown` 状态进入待确认口径 |
| Agent 方案 | 已完成 Aime + Bits + 飞书卡片 + RB 入库的 Human-in-the-loop 工作流设计，并实现可运行的示例 Skill |
| 后端接口 | 统一列表、统一编辑、新增未召回、新增 Fatal、删除 5 个接口已实现 |
| 前端页面 | 线上问题、待确认 Fatal 双视图及查询、新增、编辑、删除、详情能力已实现 |
| 筛选能力 | 重点字段组合筛选、服务端校验和 URL 状态已实现 |
| 联调验证 | BOE 页面已验证统一列表、筛选和新增未召回表单能够正常展示与交互 |
| 自动化测试 | 前后端均已覆盖统一映射、关联合并、筛选、创建、编辑、删除和页面状态等核心路径 |

BOE 页面联调快照中可以看到线上问题列表、组合筛选器、“新增未召回”“新增 Fatal”“刷新”以及行级编辑、删除入口；同时实际打开并填写过新增未召回表单，验证了页面交互链路。该验证仅说明功能链路可用，不将当时的测试记录数量作为生产数据规模。

### 2. 后续建设项

以下能力在现有材料中仍属于后续范围，我没有将其写成已完成成果：

- 统一 Stats/看板聚合接口，以及召回率、容灾成功率、趋势和分布统计；
- Aime Agent 工作流的完整线上接入，包括飞书卡片回调、状态持久化和失败重试；
- 将 `fatal-governance` 示例 Skill 接入真实 Bits/Lark/RB Tools，并完成生产发布；
- 在数据库层为 `fatal_id` 增加唯一约束，消除应用层“先查再写”的极小并发重复窗口；
- 操作日志、软删除和完整审计能力；
- Base 风格的通用条件编辑器、自定义显示列和视图预设；
- 历史 Fatal 数据完成召回状态与关联工单的持续治理。

## 六、产出价值

### 1. 数据价值

将 Fatal 和人工未召回记录从飞书 Base 迁移到 RB 业务数据库，建立可查询、可编辑、可关联的长期事实源；通过保留历史长尾字段和真实时间点，兼顾数据完整性与后续统计可信度。

### 2. 治理效率

把已召回工单、未召回问题和 Fatal 集中到一个页面，支持统一筛选、编辑和状态确认，减少在多张 Base、Radar 工单和 Fatal 页面之间来回核对的人工成本。在 Agent 工作流设计中，Aime 负责 Fatal 拉取、增量识别、卡片分发、结果校验和入库调用，人工只需处理召回判断和必要的关联信息。

### 3. 工程价值

通过统一 DTO、字段事实源路由、事务写入、关联去重、应用层幂等和字段级校验，解决了多数据源系统中常见的重复展示、双写不一致和误删问题；跨仓库接口文档则降低了前后端并行开发和后续交接成本。

### 4. 长期价值

该项目不只是复刻原有 Base，而是将线上问题治理沉淀为可扩展的平台能力。后续统计看板、Aime 自动入库、通知、审计和视图预设都可以在统一数据模型和接口契约上继续建设，无需再次迁移核心数据结构。

### 5. AI 工程价值

通过 Human-in-the-loop Agent 工作流和 Skill 化抽象，我将“AI 能力”落到了真实的稳定性治理流程中：不是单纯调用模型生成文本，而是让 Agent 在 Bits、飞书和 RB 之间进行工具编排、状态推进和异常处理，并用人工门禁和确定性校验约束高风险写操作。该设计可复用到告警确认、事故归档、复盘信息收集等其他稳定性场景。

## 七、总结

在这项工作中，我完成了从需求主线梳理、Aime Agent 工作流设计、数据库建模、后端统一读写、跨仓库接口设计到 Platform/Flinx 页面开发和 BOE 联调验证的完整链路。最终将分散在 Radar、线上问题 Base 和 Fatal Base 中的数据统一到一套可维护的线上问题台账中，并设计了“Bits 自动发现—飞书卡片确认—Aime 规则决策—RB 幂等入库”的 Human-in-the-loop 流程。通过关联去重、三态 Fatal 流程、字段事实源路由、历史数据兼容和 Skill 化抽象，为 TTFE 线上问题治理提供了可持续演进的工程基础。

## 八、参考资料

- 总体需求文档：`/Users/bytedance/Desktop/线上问题需求主线.md`
- 接口文档：`/Users/bytedance/Desktop/接口文档.md`
- [数据库设计文档](https://bytedance.sg.larkoffice.com/docx/PkpldiElYoIPhYxc3nxlkwuxgPd)
- 后端代码：`/Users/bytedance/work/ReliableBackend/ReliableBackend/app/service/web-radar/onlineIssue/main.ts`
- 前端代码：`/Users/bytedance/work/tt_arch/arch_web_monorepo/subspaces/portal/platform/src/modules/Admin/ReliabilityIssueList/OnlineIssuePanel/index.tsx`
- 示例 Skill：`/Users/bytedance/Desktop/实习产出/fatal-governance`
