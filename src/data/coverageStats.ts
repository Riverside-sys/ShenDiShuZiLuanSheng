/**
 * 2FA 覆盖可视化指标统计数据（测试核查项）
 *
 * 数字口径与《中期指标自测报告》及《委托测试申请表》保持一致：
 *  - 2.1FA 巷道场景：场景可视化覆盖率 100%（7/7 结构要素，平台侧判定）
 *  - 2.2FA 含水层场景：总体覆盖率 86.163%（DZ1/DZ2/DZ5 三条地震剖面）
 *  - 2.3FA 盐穴场景：场景覆盖率 100%（8/8 独立模型）
 * 考核指标：深部特殊封存空间数字孪生覆盖可视化区域达到 85%。
 *
 * 通过率等比率由界面运行时按 通过数/总数 自动计算展示。
 */

export interface CoverageChip {
  label: string;
  value: string;
}

/** 数据处理环节（P_k = passed / total，界面自动计算百分比） */
export interface CoverageStage {
  code: string;
  name: string;
  passed: number;
  total: number;
}

/** 判定矩阵行：checks 与 checkColumns 一一对应，1=通过 0=未通过 */
export interface CoverageMatrixRow {
  name: string;
  checks: number[];
}

/** 通用统计表行（如含水层剖面复算结果） */
export interface CoverageTableRow {
  name: string;
  cells: string[];
  highlight?: boolean;
}

export interface CoverageStatsData {
  title: string;
  subtitle: string;
  /** 最终覆盖率（百分数值，如 100 / 86.163） */
  finalRate: number;
  finalRateLabel: string;
  /** 考核指标阈值（85） */
  targetRate: number;
  /** 计算口径公式说明 */
  formula: string;
  chips: CoverageChip[];
  matrixTitle?: string;
  matrixNameLabel?: string;
  checkColumns?: string[];
  matrixRows?: CoverageMatrixRow[];
  stages?: CoverageStage[];
  tableTitle?: string;
  tableColumns?: string[];
  tableRows?: CoverageTableRow[];
  notes: string[];
}

/**
 * 2.1FA 矿山（巷道）场景覆盖率统计
 * 数据来源：《中期指标自测报告》表1（结构要素分项验证）、表2（环节通过率）。
 * 口径说明：覆盖判定以平台加载后的数据表现为准——拐弯段在建模方交付阶段
 * 存在材质缺失（交付环节材质齐全性 6/7 = 85.71%），经平台材质适配后
 * 加载表现完整，平台侧 7/7 结构要素全部覆盖，场景覆盖率 100%。
 */
export const roadwayCoverageStats: CoverageStatsData = {
  title: "巷道场景覆盖率统计",
  subtitle: "矿山（巷道）场景数字孪生覆盖可视化率 · 测试项 2.1FA",
  finalRate: 100,
  finalRateLabel: "场景可视化覆盖率",
  targetRate: 85,
  formula:
    "场景覆盖率 = 已覆盖结构要素数 ÷ 结构要素总数 × 100% = 7 ÷ 7 × 100%",
  chips: [
    { label: "统计对象", value: "卧牛山整体巷道模型（.ply）" },
    { label: "结构要素", value: "7 个" },
    { label: "点云规模", value: "约 647 万点" },
    { label: "数据处理环节", value: "5 个" },
  ],
  matrixTitle: "结构要素分项判定（7 个结构要素 × 5 项检查）",
  matrixNameLabel: "结构要素",
  checkColumns: [
    "数据完整性",
    "材质齐全性",
    "面数达标",
    "覆盖状态",
    "坐标可读性",
  ],
  matrixRows: [
    { name: "主巷东段", checks: [1, 1, 1, 1, 1] },
    { name: "主巷西段", checks: [1, 1, 1, 1, 1] },
    { name: "支巷 A", checks: [1, 1, 1, 1, 1] },
    { name: "支巷 B", checks: [1, 1, 1, 1, 1] },
    { name: "支巷 C", checks: [1, 1, 1, 1, 1] },
    { name: "连接段", checks: [1, 1, 1, 1, 1] },
    { name: "拐弯段", checks: [1, 1, 1, 1, 1] },
  ],
  stages: [
    { code: "S₁", name: "文件完整性校验", passed: 7, total: 7 },
    { code: "S₂", name: "坐标信息提取", passed: 7, total: 7 },
    { code: "S₃", name: "轻量化条件检查", passed: 7, total: 7 },
    { code: "S₄", name: "材质信息可识别性", passed: 7, total: 7 },
    { code: "S₅", name: "结构可拆分性评估", passed: 7, total: 7 },
  ],
  notes: [
    "覆盖判定以平台加载后的数据表现为准：结构要素 Mesh 数据完整、材质表现与原始模型一致、坐标可定位、体量满足轻量化要求。",
    "建模方交付阶段 S₂（材质齐全性）环节为 6/7（拐弯段交付材质缺失，交付通过率 85.71%），经平台材质适配修复后加载表现完整，平台侧通过率为 7/7（100%）。",
    "轻量化阈值：总面数 ≤ 500 万三角面，纹理分辨率 ≤ 4096×4096。",
  ],
};

/**
 * 2.2FA 含水层场景覆盖率统计
 * 数据来源：《中期指标自测报告》第三章及"表1 地震剖面覆盖率复算结果"。
 * 口径：以 DZ1/DZ2/DZ5 三条二维地震振幅剖面为统计单元，最终覆盖率 =
 * 原始有效率 × 合格道比例（q ≥ 0.75）× R_render（0.99 保守保真修正），
 * 总体 86.163%。
 */
export const aquiferCoverageStats: CoverageStatsData = {
  title: "含水层场景覆盖率统计",
  subtitle: "含水层场景多源数据融合可视化覆盖率 · 测试项 2.2FA",
  finalRate: 86.163,
  finalRateLabel: "有效信息可视化覆盖率",
  targetRate: 85,
  formula:
    "最终覆盖率 = 原始有效率 × 合格道比例 × R_render（R_render = 0.99，99% 分位裁剪保守修正）",
  chips: [
    { label: "统计对象", value: "DZ1 / DZ2 / DZ5 三条二维地震振幅剖面" },
    { label: "地震道数", value: "7,357 道" },
    { label: "采样单元", value: "9,831,071 个" },
    { label: "质量阈值", value: "波谷响应质量 q ≥ 0.75" },
    { label: "融合井数据", value: "37 口校正井位 · 8 口结构化测井" },
  ],
  tableTitle: "地震剖面覆盖率复算结果",
  tableColumns: ["剖面", "采样单元", "原始有效率", "合格道比例", "最终覆盖率"],
  tableRows: [
    { name: "DZ1", cells: ["3,052,872", "96.324%", "92.159%", "87.850%"] },
    { name: "DZ2", cells: ["2,370,422", "95.120%", "91.383%", "86.090%"] },
    { name: "DZ5", cells: ["4,407,777", "96.493%", "89.003%", "85.034%"] },
    {
      name: "总体",
      cells: ["9,831,071", "96.109%", "90.594%", "86.163%"],
      highlight: true,
    },
  ],
  notes: [
    "统计口径：以非零且有限振幅单元作为有效采样，在 620～840 m 候选窗口内复用三维模型脚本的波谷同相轴追踪方法，仅质量合格道（q ≥ 0.75）内的有效采样计入覆盖率分子。",
    "纹理生成采用 99% 分位裁剪抑制极端振幅，并按 R_render = 0.99 进行保守的可视化保真修正。",
    "敏感性分析：q 由 0.25 提高至 1.00 时，总体修正覆盖率由 91.43% 降至 76.17%；采用工程阈值 q = 0.75 时总体为 86.163%，三条剖面分别为 87.850%、86.090% 和 85.034%，均超过 85% 考核指标。",
    "平台已将三条实测振幅剖面、约 720 m 波谷追踪层位及相关井层数据（37 口校正井位、8 口结构化测井、93,048 个测井原始点）组织到同一含水层场景统一展示。",
  ],
};

/**
 * 2.3FA 盐穴场景覆盖率统计
 * 数据来源：《中期指标自测报告》第二章及环节通过率表。
 * 口径：对第 i 个盐穴模型定义覆盖状态 C(i) = S₁(i)×S₂(i)×S₃(i)×S₄(i)×S₅(i)，
 * 场景覆盖率 R = ΣC(i) ÷ 8 × 100% = 8/8 = 100%。
 */
export const saltCaveCoverageStats: CoverageStatsData = {
  title: "盐穴场景覆盖率统计",
  subtitle: "盐穴场景数字孪生覆盖可视化率 · 测试项 2.3FA",
  finalRate: 100,
  finalRateLabel: "场景覆盖率",
  targetRate: 85,
  formula:
    "R = ( Σ C(i) ) ÷ 8 × 100% = 8 ÷ 8 × 100%，其中 C(i) = S₁(i) × S₂(i) × S₃(i) × S₄(i) × S₅(i)",
  chips: [
    { label: "统计对象", value: "8 个独立盐穴三维模型（.ply）" },
    { label: "空间对象", value: "盐穴腔体 · 井场设施 · 井间连接管道" },
    { label: "数据处理环节", value: "5 个" },
  ],
  matrixTitle: "独立模型分项判定（8 个模型 × 5 项检查）",
  matrixNameLabel: "独立模型",
  checkColumns: [
    "文件完整性",
    "坐标信息",
    "轻量化条件",
    "材质可识别",
    "格式兼容性",
  ],
  matrixRows: [
    { name: "盐穴模型 1", checks: [1, 1, 1, 1, 1] },
    { name: "盐穴模型 2", checks: [1, 1, 1, 1, 1] },
    { name: "盐穴模型 3", checks: [1, 1, 1, 1, 1] },
    { name: "盐穴模型 4", checks: [1, 1, 1, 1, 1] },
    { name: "盐穴模型 5", checks: [1, 1, 1, 1, 1] },
    { name: "盐穴模型 6", checks: [1, 1, 1, 1, 1] },
    { name: "盐穴模型 7", checks: [1, 1, 1, 1, 1] },
    { name: "盐穴模型 8", checks: [1, 1, 1, 1, 1] },
  ],
  stages: [
    { code: "S₁", name: "文件完整性校验", passed: 8, total: 8 },
    { code: "S₂", name: "坐标信息提取", passed: 8, total: 8 },
    { code: "S₃", name: "轻量化条件检查", passed: 8, total: 8 },
    { code: "S₄", name: "材质信息可识别性", passed: 8, total: 8 },
    { code: "S₅", name: "格式兼容性验证", passed: 8, total: 8 },
  ],
  notes: [
    "覆盖判定：5 个环节全部通过的模型认定为已覆盖（C(i)=1），任一环节未通过认定为未覆盖（C(i)=0）。",
    "盐穴场景共 8 个独立模型文件（.ply），覆盖盐穴腔体、井场设施及井间连接管道三类空间对象；平台加载后腔体几何形态完整，表面纹理清晰，具备可视化表达条件。",
    "8 个模型全部通过 5 个数据处理环节验证，场景覆盖率 100%。",
  ],
};
