export interface JidaSeismicSectionSummary {
  id: "DZ1" | "DZ2" | "DZ5";
  depthSamples: number;
  traceCount: number;
  lineLengthKm: number;
  targetDepthM: number;
  horizonMinimumM: number;
  horizonMaximumM: number;
  placement: string;
}

/**
 * DZ1/DZ2/DZ5 MAT 矩阵的可复核摘要。
 * 道数、采样点数来自原文件；长度按 5 m CDP 间距计算。
 * 层位范围来自约 720 m 蓝色波谷的自动追踪，仅作科研展示解释。
 */
export const JIDA_SEISMIC_SECTIONS: readonly JidaSeismicSectionSummary[] = [
  {
    id: "DZ1",
    depthSamples: 1308,
    traceCount: 2334,
    lineLengthKm: 11.665,
    targetDepthM: 719,
    horizonMinimumM: 646.8,
    horizonMaximumM: 793.1,
    placement: "与 DZ2 实测相交",
  },
  {
    id: "DZ2",
    depthSamples: 1301,
    traceCount: 1822,
    lineLengthKm: 9.105,
    targetDepthM: 718,
    horizonMinimumM: 673.1,
    horizonMaximumM: 771.1,
    placement: "与 DZ1 实测相交",
  },
  {
    id: "DZ5",
    depthSamples: 1377,
    traceCount: 3201,
    lineLengthKm: 16,
    targetDepthM: 724,
    horizonMinimumM: 669.4,
    horizonMaximumM: 849.4,
    placement: "平行 DZ1、偏移 3 km（模拟）",
  },
] as const;

export const JIDA_SEISMIC_SURVEY_SUMMARY = {
  sectionCount: JIDA_SEISMIC_SECTIONS.length,
  totalTraces: JIDA_SEISMIC_SECTIONS.reduce(
    (sum, section) => sum + section.traceCount,
    0,
  ),
  totalLineLengthKm: JIDA_SEISMIC_SECTIONS.reduce(
    (sum, section) => sum + section.lineLengthKm,
    0,
  ),
  cdpSpacingM: 5,
  inferredDepthIntervalM: 1,
  intersection: "DZ1 第 652 道 / DZ2 第 743 道",
} as const;
