# Interview guide

## Thirty-second summary

“我把 Fatal 治理设计成一个 Human-in-the-loop Agent Skill。Aime 定时从 Bits 发现新增 Fatal，在飞书群发送交互卡片，由业务人员确认召回状态；Agent 再执行字段完整性、关联工单和幂等校验，最后通过受控 Tool 调用 RB 入库。核心不是让模型替人判断事故，而是让 Agent 编排跨系统流程，并用人工门禁和确定性代码约束高风险写操作。”

## Explain the design in five layers

1. **Trigger**：定时任务或人工指令触发 Fatal 扫描。
2. **Tools**：Bits 查询、飞书卡片、RB 查询与创建接口都封装为窄工具。
3. **State**：用状态机记录 discovered、card_pending、validated、persisted 等阶段，支持恢复和重试。
4. **Guardrails**：召回状态必须人工确认；已召回必须关联 Radar 工单；重复 Fatal 不覆盖。
5. **Observability**：用 `fatalId` 和卡片 ID 串联日志、重试和最终记录。

## Why use a Skill

- 把公司内部字段、状态机、工具顺序和安全门禁固化为可复用过程，而不是依赖 Prompt 临时发挥。
- 通过渐进式上下文加载，让 Agent 默认只读取核心流程，需要时再加载工具契约和案例。
- 用确定性脚本处理脆弱规则，减少模型在格式校验和跨字段约束上的不稳定性。
- 同一 Skill 可以被定时任务、群聊指令和人工补录入口复用。

## Important trade-offs

- **为什么不让 LLM 自动判断是否召回？** 召回状态是高风险业务事实，缺少可靠 ground truth；人工确认的成本远低于错误入库的治理成本。
- **为什么仍需要 Agent？** Agent 擅长跨 Bits、飞书和 RB 编排工具、保持状态、解释错误和推动待办，人只处理少量关键判断。
- **为什么要状态机？** 卡片回调是异步的，且可能重复或失败；没有显式状态就难以恢复、幂等和审计。
- **应用层幂等够吗？** 不够。示例保留 query-before-create，但生产环境应增加 `fatal_id` 数据库唯一约束。
- **Skill 和普通工作流有什么区别？** Skill 同时封装触发语义、领域知识、工具顺序、安全策略和输出契约，可被 Agent 在不同入口复用。

## Honest implementation boundary

可以表述为：已完成 RB 数据模型、Fatal 创建接口、Platform 页面和 Agent/Skill 规格设计；示例 Skill 包含可运行的决策校验器。Aime 飞书卡片回调、生产状态存储和完整工具适配仍是后续接入项。不要声称未上线的适配器已经在生产运行。

## A useful follow-up answer

如果面试官问“下一步怎么做”，回答：先补 `fatal_id` 数据库唯一索引，再实现 Aime 状态存储和飞书卡片回调去重；随后为 Bits、Lark、RB 编写窄 MCP/Tool adapter，最后用回放数据验证重复回调、5xx 重试、人工修改决定和并发入库等边界场景。
