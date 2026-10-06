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
