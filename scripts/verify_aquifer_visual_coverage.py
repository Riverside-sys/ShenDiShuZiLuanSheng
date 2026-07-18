#!/usr/bin/env python3
"""复算含水层场景的有效信息覆盖率并生成验收图表。

统计口径：以吉大交付的 DZ1/DZ2/DZ5 振幅矩阵为参考基准域；先统计
非零有效采样，再复用三维模型脚本的波谷同相轴追踪方法进行逐道质量门控，
最后施加与纹理生成一致的 0.99 可视化保真修正系数。

注意：本脚本评价的是“交付数据域中的有效信息可视化覆盖”，不评价真实
地下含水层的物理面积或体积覆盖；模拟含水层体不进入覆盖率分子。
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from dataclasses import asdict, dataclass
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from build_jida_aquifer_model import SECTION_SPECS, high_pass, load_section, track_trough


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = ROOT / "outputs/aquifer_coverage"
SOURCE_DIR = ROOT / "src/Views/hanshuiceng/data/26-7吉大含水层资料"

QUALITY_THRESHOLD = 0.75
RENDER_FIDELITY = 0.99
VALID_EPSILON = 1.0e-6
SENSITIVITY_THRESHOLDS = (0.25, 0.50, 0.75, 1.00)


@dataclass(frozen=True)
class SectionResult:
    name: str
    rows: int
    traces: int
    total_cells: int
    valid_cells: int
    valid_rate_percent: float
    qualified_traces: int
    qualified_trace_rate_percent: float
    qualified_valid_cells: int
    data_coverage_percent: float
    effective_coverage_percent: float
    sha256: str


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def trace_quality(filtered: np.ndarray, horizon: np.ndarray) -> np.ndarray:
    """返回每条地震道的波谷响应质量 q_j。"""
    depth_min, depth_max = 620, 840
    window = filtered[depth_min : depth_max + 1]
    reference = np.percentile(np.abs(window), 85.0, axis=0) + 1.0e-6
    depth_index = np.clip(np.rint(horizon).astype(np.int32), 0, filtered.shape[0] - 1)
    trace_index = np.arange(filtered.shape[1], dtype=np.int32)
    trough_strength = np.maximum(0.0, -filtered[depth_index, trace_index])
    return trough_strength / reference


def calculate(output_dir: Path) -> dict:
    section_results: list[SectionResult] = []
    qualities: dict[str, np.ndarray] = {}
    valid_masks: dict[str, np.ndarray] = {}

    for spec in SECTION_SPECS:
        raw = load_section(spec.name)
        valid = np.isfinite(raw) & (np.abs(raw) > VALID_EPSILON)
        filtered = high_pass(raw)
        horizon = track_trough(
            filtered,
            spec.intersection_trace - 1,
            spec.seed_depth_m,
        )
        quality = trace_quality(filtered, horizon)
        qualified = quality >= QUALITY_THRESHOLD

        total_cells = int(raw.size)
        valid_cells = int(valid.sum())
        qualified_valid_cells = int(valid[:, qualified].sum())
        data_coverage = qualified_valid_cells / total_cells

        result = SectionResult(
            name=spec.name,
            rows=int(raw.shape[0]),
            traces=int(raw.shape[1]),
            total_cells=total_cells,
            valid_cells=valid_cells,
            valid_rate_percent=100.0 * valid_cells / total_cells,
            qualified_traces=int(qualified.sum()),
            qualified_trace_rate_percent=100.0 * qualified.mean(),
            qualified_valid_cells=qualified_valid_cells,
            data_coverage_percent=100.0 * data_coverage,
            effective_coverage_percent=100.0 * data_coverage * RENDER_FIDELITY,
            sha256=sha256_file(SOURCE_DIR / f"{spec.name}.mat"),
        )
        section_results.append(result)
        qualities[spec.name] = quality
        valid_masks[spec.name] = valid

    totals = {
        "total_cells": sum(item.total_cells for item in section_results),
        "valid_cells": sum(item.valid_cells for item in section_results),
        "qualified_traces": sum(item.qualified_traces for item in section_results),
        "total_traces": sum(item.traces for item in section_results),
        "qualified_valid_cells": sum(item.qualified_valid_cells for item in section_results),
    }
    totals["invalid_cells"] = totals["total_cells"] - totals["valid_cells"]
    totals["valid_rate_percent"] = 100.0 * totals["valid_cells"] / totals["total_cells"]
    totals["qualified_trace_rate_percent"] = (
        100.0 * totals["qualified_traces"] / totals["total_traces"]
    )
    totals["data_coverage_percent"] = (
        100.0 * totals["qualified_valid_cells"] / totals["total_cells"]
    )
    totals["effective_coverage_percent"] = (
        totals["data_coverage_percent"] * RENDER_FIDELITY
    )

    sensitivity = []
    for threshold in SENSITIVITY_THRESHOLDS:
        qualified_valid_cells = 0
        qualified_traces = 0
        per_section = {}
        for item in section_results:
            mask = qualities[item.name] >= threshold
            valid_cells = int(valid_masks[item.name][:, mask].sum())
            coverage = 100.0 * valid_cells / item.total_cells * RENDER_FIDELITY
            qualified_valid_cells += valid_cells
            qualified_traces += int(mask.sum())
            per_section[item.name] = coverage
        sensitivity.append(
            {
                "quality_threshold": threshold,
                "qualified_traces": qualified_traces,
                "effective_coverage_percent": (
                    100.0
                    * qualified_valid_cells
                    / totals["total_cells"]
                    * RENDER_FIDELITY
                ),
                "per_section_percent": per_section,
            }
        )

    payload = {
        "metric_name": "含水层交付数据域有效信息可视化覆盖率",
        "reference_domain": "吉大交付 DZ1/DZ2/DZ5 地震振幅矩阵",
        "quality_threshold": QUALITY_THRESHOLD,
        "render_fidelity": RENDER_FIDELITY,
        "valid_epsilon": VALID_EPSILON,
        "sections": [asdict(item) for item in section_results],
        "overall": totals,
        "sensitivity": sensitivity,
        "limitations": [
            "评价对象是交付数据域，不是真实地下含水层的物理面积或体积。",
            "DZ5空间位置、剖面间插值及含水层厚度为科研展示模拟，不计入覆盖率分子。",
            "0.75为本次验证采用的工程质量阈值，正式验收前应在测试方案中固化。",
        ],
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "aquifer_coverage_results.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    write_csv(output_dir, section_results, totals)
    draw_main_figure(output_dir, section_results, totals)
    draw_sensitivity_figure(output_dir, sensitivity)
    return payload


def write_csv(
    output_dir: Path, section_results: list[SectionResult], totals: dict
) -> None:
    path = output_dir / "aquifer_coverage_summary.csv"
    columns = [
        "剖面",
        "矩阵行数",
        "地震道数",
        "总采样单元",
        "有效采样单元",
        "原始有效率(%)",
        "质量合格道数",
        "合格道比例(%)",
        "合格道内有效单元",
        "数据覆盖率(%)",
        "修正覆盖率(%)",
    ]
    with path.open("w", newline="", encoding="utf-8-sig") as stream:
        writer = csv.writer(stream)
        writer.writerow(columns)
        for item in section_results:
            writer.writerow(
                [
                    item.name,
                    item.rows,
                    item.traces,
                    item.total_cells,
                    item.valid_cells,
                    f"{item.valid_rate_percent:.3f}",
                    item.qualified_traces,
                    f"{item.qualified_trace_rate_percent:.3f}",
                    item.qualified_valid_cells,
                    f"{item.data_coverage_percent:.3f}",
                    f"{item.effective_coverage_percent:.3f}",
                ]
            )
        writer.writerow(
            [
                "总体",
                "-",
                totals["total_traces"],
                totals["total_cells"],
                totals["valid_cells"],
                f"{totals['valid_rate_percent']:.3f}",
                totals["qualified_traces"],
                f"{totals['qualified_trace_rate_percent']:.3f}",
                totals["qualified_valid_cells"],
                f"{totals['data_coverage_percent']:.3f}",
                f"{totals['effective_coverage_percent']:.3f}",
            ]
        )


def setup_plot_style() -> None:
    plt.rcParams.update(
        {
            "font.sans-serif": [
                "Microsoft YaHei",
                "SimHei",
                "Noto Sans CJK SC",
                "DejaVu Sans",
            ],
            "axes.unicode_minus": False,
            "font.size": 10,
            "axes.titlesize": 12,
            "axes.labelsize": 10,
            "figure.dpi": 160,
            "savefig.dpi": 240,
        }
    )


def draw_main_figure(
    output_dir: Path, sections: list[SectionResult], totals: dict
) -> None:
    setup_plot_style()
    figure, axes = plt.subplots(1, 2, figsize=(12.2, 4.4), constrained_layout=True)
    figure.patch.set_facecolor("white")

    stages = [
        100.0,
        totals["valid_rate_percent"],
        totals["data_coverage_percent"],
        totals["effective_coverage_percent"],
    ]
    labels = ["参考数据域", "有效振幅", "质量门控后", "可视化修正后"]
    colors = ["#355C7D", "#2A9D8F", "#E9C46A", "#E76F51"]
    x = np.arange(len(stages))
    bars = axes[0].bar(x, stages, width=0.62, color=colors, edgecolor="#263238", linewidth=0.6)
    axes[0].axhline(85.0, color="#C62828", linestyle="--", linewidth=1.2, label="指标阈值 85%")
    axes[0].set_ylim(80, 102.5)
    axes[0].set_xticks(x, labels)
    axes[0].set_ylabel("覆盖率 / %")
    axes[0].set_title("(a) 有效信息覆盖率计算链")
    axes[0].grid(axis="y", linestyle=":", alpha=0.35)
    axes[0].legend(frameon=False, loc="lower left")
    for bar, value in zip(bars, stages):
        axes[0].text(
            bar.get_x() + bar.get_width() / 2,
            value + 0.45,
            f"{value:.2f}%",
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
        )

    names = [item.name for item in sections]
    raw = [item.valid_rate_percent for item in sections]
    data = [item.data_coverage_percent for item in sections]
    effective = [item.effective_coverage_percent for item in sections]
    width = 0.24
    x2 = np.arange(len(names))
    axes[1].bar(x2 - width, raw, width, label="原始有效率", color="#457B9D")
    axes[1].bar(x2, data, width, label="质量门控后", color="#2A9D8F")
    final_bars = axes[1].bar(x2 + width, effective, width, label="最终修正", color="#E76F51")
    axes[1].axhline(85.0, color="#C62828", linestyle="--", linewidth=1.2)
    axes[1].set_ylim(82, 99)
    axes[1].set_xticks(x2, names)
    axes[1].set_ylabel("覆盖率 / %")
    axes[1].set_title("(b) 三条地震剖面分项结果")
    axes[1].grid(axis="y", linestyle=":", alpha=0.35)
    axes[1].legend(frameon=False, ncol=3, loc="upper center", fontsize=8)
    for bar, value in zip(final_bars, effective):
        axes[1].text(
            bar.get_x() + bar.get_width() / 2,
            value + 0.25,
            f"{value:.2f}%",
            ha="center",
            va="bottom",
            fontsize=8,
            fontweight="bold",
        )

    figure.suptitle("吉大地震剖面有效信息可视化覆盖率验证", fontsize=14, fontweight="bold")
    figure.savefig(output_dir / "aquifer_coverage_main_figure.png", bbox_inches="tight")
    plt.close(figure)


def draw_sensitivity_figure(output_dir: Path, sensitivity: list[dict]) -> None:
    setup_plot_style()
    figure, axis = plt.subplots(figsize=(8.2, 3.8), constrained_layout=True)
    thresholds = [item["quality_threshold"] for item in sensitivity]
    overall = [item["effective_coverage_percent"] for item in sensitivity]
    axis.plot(
        thresholds,
        overall,
        marker="o",
        linewidth=2.1,
        color="#264653",
        label="总体修正覆盖率",
    )
    for name, color in zip(("DZ1", "DZ2", "DZ5"), ("#457B9D", "#2A9D8F", "#E76F51")):
        axis.plot(
            thresholds,
            [item["per_section_percent"][name] for item in sensitivity],
            marker=".",
            linewidth=1.2,
            color=color,
            alpha=0.85,
            label=name,
        )
    axis.axhline(85.0, color="#C62828", linestyle="--", linewidth=1.2, label="指标阈值 85%")
    axis.axvline(QUALITY_THRESHOLD, color="#6A4C93", linestyle=":", linewidth=1.2)
    axis.annotate(
        f"采用阈值 q = {QUALITY_THRESHOLD:.2f}\n总体 {overall[2]:.2f}%",
        xy=(QUALITY_THRESHOLD, overall[2]),
        xytext=(0.53, 93.2),
        arrowprops={"arrowstyle": "->", "color": "#6A4C93"},
        fontsize=9,
        color="#4A3766",
    )
    axis.set_xlabel("逐道波谷响应质量阈值 q")
    axis.set_ylabel("修正覆盖率 / %")
    axis.set_title("质量阈值敏感性分析")
    axis.set_xticks(thresholds)
    axis.set_ylim(70, 95)
    axis.grid(linestyle=":", alpha=0.38)
    axis.legend(frameon=False, ncol=3, fontsize=8, loc="lower left")
    figure.savefig(output_dir / "aquifer_coverage_threshold_sensitivity.png", bbox_inches="tight")
    plt.close(figure)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="统计结果与图表输出目录",
    )
    args = parser.parse_args()
    payload = calculate(args.output_dir.resolve())
    overall = payload["overall"]
    print(f"总采样单元: {overall['total_cells']:,}")
    print(f"有效采样单元: {overall['valid_cells']:,} ({overall['valid_rate_percent']:.3f}%)")
    print(
        f"质量合格地震道: {overall['qualified_traces']:,}/{overall['total_traces']:,} "
        f"({overall['qualified_trace_rate_percent']:.3f}%)"
    )
    print(f"质量门控后覆盖率: {overall['data_coverage_percent']:.3f}%")
    print(f"最终修正覆盖率: {overall['effective_coverage_percent']:.3f}%")
    print(f"输出目录: {args.output_dir.resolve()}")


if __name__ == "__main__":
    main()
