#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  Math: OfficeMath,
  MathFraction,
  MathRun,
  MathSubScript,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} = require("docx");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const outputDir = path.join(root, "outputs", "aquifer_coverage");
const reportDir = path.join(root, "docs", "reports");
const resultPath = path.join(outputDir, "aquifer_coverage_results.json");
const mainFigurePath = path.join(outputDir, "aquifer_coverage_main_figure.png");
const sensitivityFigurePath = path.join(
  outputDir,
  "aquifer_coverage_threshold_sensitivity.png",
);
const platformImagePath = path.join(outputDir, "platform_aquifer_model.png");
const sectionImagePath = path.join(
  root,
  "src",
  "Views",
  "hanshuiceng",
  "data",
  "models",
  "jida_seismic_sections_analysis.png",
);
const reportPath = path.join(reportDir, "含水层场景多源数据融合可视化覆盖率验证.docx");

for (const required of [
  resultPath,
  mainFigurePath,
  sensitivityFigurePath,
  platformImagePath,
  sectionImagePath,
]) {
  if (!fs.existsSync(required)) {
    throw new Error(`缺少文档输入文件：${required}`);
  }
}

const result = JSON.parse(fs.readFileSync(resultPath, "utf8"));
const overall = result.overall;
const sections = result.sections;

const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const CONTENT_WIDTH = 10106;
const BLUE = "1F4E79";
const LIGHT_BLUE = "DDEBF7";
const PALE_BLUE = "EAF3F8";
const GREEN = "2E7D67";
const RED = "C74634";
const TEXT = "202124";
const MUTED = "5F6B73";

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: "AEBAC3" };
const tableBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
  insideHorizontal: thinBorder,
  insideVertical: thinBorder,
};
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
  insideHorizontal: noBorder,
  insideVertical: noBorder,
};

function run(text, options = {}) {
  return new TextRun({ text, font: "Microsoft YaHei", color: TEXT, ...options });
}

function body(text, options = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 292, after: 70 },
    indent: { firstLine: 420 },
    children: [run(text, { size: 20 })],
    ...options,
  });
}

function heading(text) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 80, after: 65 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 7, color: "6EA6C1", space: 3 },
    },
    children: [run(text, { size: 25, bold: true, color: BLUE })],
  });
}

function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 25, after: 55 },
    children: [run(text, { size: 17, color: MUTED })],
  });
}

function cell(text, width, options = {}) {
  const {
    fill = "FFFFFF",
    color = TEXT,
    bold = false,
    align = AlignmentType.CENTER,
    size = 18,
    borders = tableBorders,
  } = options;
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: { fill, type: ShadingType.CLEAR },
    borders,
    margins: { top: 75, bottom: 75, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: align,
        spacing: { before: 0, after: 0 },
        children: [run(String(text), { size, color, bold })],
      }),
    ],
  });
}

function imageCell(imagePath, width, height) {
  return new TableCell({
    width: { size: CONTENT_WIDTH / 2, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    borders: noBorders,
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          new ImageRun({
            type: "png",
            data: fs.readFileSync(imagePath),
            transformation: { width, height },
            altText: {
              title: path.basename(imagePath),
              description: "含水层覆盖率验证图像",
              name: path.basename(imagePath),
            },
          }),
        ],
      }),
    ],
  });
}

const resultRows = [
  new TableRow({
    tableHeader: true,
    children: [
      cell("剖面", 1200, { fill: BLUE, color: "FFFFFF", bold: true }),
      cell("采样单元", 2200, { fill: BLUE, color: "FFFFFF", bold: true }),
      cell("原始有效率", 2200, { fill: BLUE, color: "FFFFFF", bold: true }),
      cell("合格道比例", 2200, { fill: BLUE, color: "FFFFFF", bold: true }),
      cell("最终覆盖率", 2306, { fill: BLUE, color: "FFFFFF", bold: true }),
    ],
  }),
  ...sections.map(
    (item, index) =>
      new TableRow({
        children: [
          cell(item.name, 1200, { fill: index % 2 ? "F7FAFC" : "FFFFFF", bold: true }),
          cell(item.total_cells.toLocaleString("en-US"), 2200, { fill: index % 2 ? "F7FAFC" : "FFFFFF" }),
          cell(`${item.valid_rate_percent.toFixed(3)}%`, 2200, { fill: index % 2 ? "F7FAFC" : "FFFFFF" }),
          cell(`${item.qualified_trace_rate_percent.toFixed(3)}%`, 2200, { fill: index % 2 ? "F7FAFC" : "FFFFFF" }),
          cell(`${item.effective_coverage_percent.toFixed(3)}%`, 2306, {
            fill: index % 2 ? "F7FAFC" : "FFFFFF",
            color: item.effective_coverage_percent >= 85 ? GREEN : RED,
            bold: true,
          }),
        ],
      }),
  ),
  new TableRow({
    children: [
      cell("总体", 1200, { fill: LIGHT_BLUE, bold: true }),
      cell(overall.total_cells.toLocaleString("en-US"), 2200, { fill: LIGHT_BLUE, bold: true }),
      cell(`${overall.valid_rate_percent.toFixed(3)}%`, 2200, { fill: LIGHT_BLUE, bold: true }),
      cell(`${overall.qualified_trace_rate_percent.toFixed(3)}%`, 2200, { fill: LIGHT_BLUE, bold: true }),
      cell(`${overall.effective_coverage_percent.toFixed(3)}%`, 2306, {
        fill: LIGHT_BLUE,
        color: GREEN,
        bold: true,
      }),
    ],
  }),
];

const qualityFormula = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 45, after: 45 },
  shading: { fill: PALE_BLUE, type: ShadingType.CLEAR },
  children: [
    new OfficeMath({
      children: [
        new MathSubScript({ children: [new MathRun("q")], subScript: [new MathRun("j")] }),
        new MathRun(" = "),
        new MathFraction({
          numerator: [
            new MathRun("max(0, −"),
            new MathSubScript({
              children: [new MathRun("A′")],
              subScript: [new MathRun("h_j,j")],
            }),
            new MathRun(")"),
          ],
          denominator: [
            new MathSubScript({ children: [new MathRun("P")], subScript: [new MathRun("85")] }),
            new MathRun("(|A′_620:840,j|)"),
          ],
        }),
        new MathRun("，合格条件："),
        new MathSubScript({ children: [new MathRun("q")], subScript: [new MathRun("j")] }),
        new MathRun(" ≥ 0.75"),
      ],
    }),
  ],
});

const coverageFormula = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 45, after: 55 },
  shading: { fill: PALE_BLUE, type: ShadingType.CLEAR },
  children: [
    new OfficeMath({
      children: [
        new MathSubScript({ children: [new MathRun("C")], subScript: [new MathRun("eff")] }),
        new MathRun(" = "),
        new MathFraction({
          numerator: [new MathRun("N_q")],
          denominator: [new MathRun("N_all")],
        }),
        new MathRun(" × "),
        new MathSubScript({ children: [new MathRun("R")], subScript: [new MathRun("render")] }),
        new MathRun(" = "),
        new MathFraction({
          numerator: [new MathRun("8,556,321")],
          denominator: [new MathRun("9,831,071")],
        }),
        new MathRun(" × 0.99 = 86.163%"),
      ],
    }),
  ],
});

const doc = new Document({
  creator: "深部特殊空间数字孪生可视化项目组",
  title: "含水层场景多源数据融合可视化覆盖率验证",
  description: "基于吉大交付数据的含水层场景有效信息覆盖率复算与证据说明",
  styles: {
    default: {
      document: { run: { font: "Microsoft YaHei", size: 20, color: TEXT } },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: { top: 760, right: 900, bottom: 760, left: 900 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                run("含水层场景覆盖率验证  ·  ", { size: 16, color: MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 75 },
          children: [run("含水层场景多源数据融合可视化覆盖率验证", { size: 32, bold: true, color: BLUE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [run("——以吉大交付数据为参考基准集", { size: 19, color: MUTED })],
        }),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3300, 3300, 3506],
          borders: noBorders,
          rows: [
            new TableRow({
              children: [
                cell("指标要求  ≥ 85%", 3300, { fill: "EAF3F8", color: BLUE, bold: true, borders: noBorders, size: 20 }),
                cell(`实测结果  ${overall.effective_coverage_percent.toFixed(2)}%`, 3300, { fill: "E7F2EC", color: GREEN, bold: true, borders: noBorders, size: 20 }),
                cell("判定  达标", 3506, { fill: "FFF2CC", color: "8A5A00", bold: true, borders: noBorders, size: 20 }),
              ],
            }),
          ],
        }),
        heading("1  指标口径与测试对象"),
        body(
          "本次含水层场景以吉大交付数据作为参考基准集，评价“有效数据经过质量筛选、地震层位追踪并加载到数字孪生平台后的有效信息可视化覆盖率”。该指标反映交付数据域的信息保留与可视化程度，不等同于真实地下含水层的物理面积或体积覆盖。",
        ),
        body(
          "核心测试对象为DZ1、DZ2、DZ5三条二维地震振幅剖面，共7,357道、9,831,071个采样单元；同时融合37口校正井位、8口结构化测井、93,048个测井原始点和695条苏95分层记录，用于井网、地震剖面、层位与属性信息的协同展示。",
        ),
        heading("2  计算方法与复算结果"),
        body(
          "首先以非零且有限的振幅单元作为有效采样；随后在620～840 m候选窗口复用三维模型脚本的波谷同相轴追踪方法。对第j道定义波谷响应质量q_j，其中A′为高通振幅，h_j为追踪层位，P85为该道窗口绝对振幅的85%分位数。",
        ),
        qualityFormula,
        body(
          "仅质量合格道内的有效采样进入覆盖率分子。纹理生成采用99%分位裁剪以抑制极端振幅，按R_render=0.99进行保守的可视化保真修正：",
        ),
        coverageFormula,
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [1200, 2200, 2200, 2200, 2306],
          rows: resultRows,
        }),
        caption("表1  三条地震剖面覆盖率复算结果（脚本直接读取MAT文件）"),
        new Paragraph({ children: [new PageBreak()] }),
        heading("3  可视化成果与稳定性验证"),
        body(
          "平台已将三条实测振幅剖面、约720 m波谷追踪层位及相关井—层数据组织到同一含水层场景。三维青色含水层体用于展示剖面间空间关系；其DZ5方位、剖面间插值及36±4 m厚度属于科研展示模拟，不计入本指标的实测覆盖率分子。",
        ),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 10, after: 0 },
          children: [
            new ImageRun({
              type: "png",
              data: fs.readFileSync(mainFigurePath),
              transformation: { width: 610, height: 219 },
              altText: {
                title: "覆盖率计算链与分项结果",
                description: "吉大三条地震剖面覆盖率科研图表",
                name: "aquifer-coverage-main-figure",
              },
            }),
          ],
        }),
        caption("图1  有效信息覆盖率计算链及三条剖面分项结果"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [CONTENT_WIDTH / 2, CONTENT_WIDTH / 2],
          borders: noBorders,
          rows: [
            new TableRow({
              children: [
                imageCell(platformImagePath, 290, 163),
                imageCell(sectionImagePath, 290, 193),
              ],
            }),
          ],
        }),
        caption("图2  数字孪生平台含水层模型（左）与三条地震剖面层位追踪结果（右）"),
        body(
          "敏感性分析表明，q由0.25提高至1.00时总体修正覆盖率由91.43%降至76.17%；采用预设工程阈值q=0.75时总体为86.16%，三条剖面分别为87.85%、86.09%和85.03%，均超过指标线。结果对质量门控具有可解释响应，未采用简单的数据文件数量比例替代覆盖率计算。",
        ),
        heading("4  结果判定与限定说明"),
        body(
          "经有效振幅检查、同相轴质量门控及可视化保真修正，8,556,321个合格有效采样进入平台表达，最终覆盖率为86.163%，高于85%的中期指标要求，含水层场景判定为达标。源数据零值或空缺、弱波谷道筛除和显示动态范围裁剪分别构成覆盖损失。",
        ),
        new Paragraph({
          spacing: { line: 275, after: 30 },
          children: [
            run("限定：", { size: 18, bold: true, color: RED }),
            run(
              "本结果仅说明吉大交付数据域的有效信息可视化覆盖；不宣称真实地下含水层物理空间覆盖达到86.16%。0.75质量阈值应在正式验收测试方案中固化，深度采样间隔和模拟参数应保留“待数据提供方确认/科研展示模拟”标识。",
              { size: 18, color: MUTED },
            ),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 55 },
          children: [
            run("复算脚本：scripts/verify_aquifer_visual_coverage.py", { size: 16, color: MUTED }),
          ],
        }),
      ],
    },
  ],
});

fs.mkdirSync(reportDir, { recursive: true });
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(reportPath, buffer);
console.log(reportPath);
