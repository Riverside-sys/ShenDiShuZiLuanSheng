#!/usr/bin/env python3
"""Export aquifer column-diagram DWGs to web preview JPEGs.

Requires:
  - ODA File Converter at /Applications/ODAFileConverter.app
  - Python packages: ezdxf, matplotlib, pillow

Source DWGs live under the gitignored Jida data directory.
Outputs go to public/aquifer/documents/.
"""

from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from ezdxf import recover
from ezdxf.addons.drawing import Frontend, RenderContext
from ezdxf.addons.drawing.config import BackgroundPolicy, Configuration
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
from PIL import Image

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIRECTORY = (
    REPOSITORY_ROOT
    / "src/Views/hanshuiceng/data/26-7吉大含水层资料/含水层资料"
)
OUTPUT_DIRECTORY = REPOSITORY_ROOT / "public/aquifer/documents"
ODA_CONVERTER = Path(
    "/Applications/ODAFileConverter.app/Contents/MacOS/ODAFileConverter"
)

JOBS = (
    ("1：500--淮安盐盆石塘矿区石4井地层综合柱状.dwg", "shi4.dwg", "shi4-column.jpg"),
    ("zk5井地层综合柱状图.dwg", "zk5.dwg", "zk5-column.jpg"),
    ("zk6井地层综合柱状图.dwg", "zk6.dwg", "zk6-column.jpg"),
)


def convert_dwg_dir_to_dxf(source_dir: Path, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            str(ODA_CONVERTER),
            str(source_dir),
            str(output_dir),
            "ACAD2018",
            "DXF",
            "0",
            "1",
            "*.dwg",
        ],
        check=True,
    )


def render_dxf_to_jpeg(dxf_path: Path, jpeg_path: Path, width_px: int = 1600) -> None:
    doc, auditor = recover.readfile(dxf_path)
    if auditor.has_errors:
        print(f"  warning: {dxf_path.name} auditor errors={len(auditor.errors)}")

    cfg = Configuration(background_policy=BackgroundPolicy.WHITE)
    msp = doc.modelspace()

    probe = plt.figure(dpi=72)
    probe_ax = probe.add_axes([0, 0, 1, 1])
    Frontend(RenderContext(doc), MatplotlibBackend(probe_ax), config=cfg).draw_layout(
        msp, finalize=True
    )
    xmin, xmax = probe_ax.get_xlim()
    ymin, ymax = probe_ax.get_ylim()
    plt.close(probe)

    width = abs(xmax - xmin)
    height = abs(ymax - ymin)
    aspect = height / width if width else 1.0
    height_px = min(18_000, int(width_px * aspect))
    width_px = max(700, int(height_px / aspect))
    dpi = 120

    fig = plt.figure(figsize=(width_px / dpi, height_px / dpi), dpi=dpi)
    ax = fig.add_axes([0, 0, 1, 1])
    Frontend(RenderContext(doc), MatplotlibBackend(ax), config=cfg).draw_layout(
        msp, finalize=True
    )
    # ezdxf finalize forces equal-aspect and shrinks the figure; restore target size.
    ax.set_aspect("auto")
    fig.set_size_inches(width_px / dpi, height_px / dpi, forward=True)
    ax.set_xlim(xmin, xmax)
    ax.set_ylim(ymin, ymax)
    ax.set_axis_off()

    png_path = jpeg_path.with_suffix(".png")
    fig.savefig(png_path, dpi=dpi, facecolor="white", pad_inches=0)
    plt.close(fig)

    image = Image.open(png_path).convert("RGB")
    array = np.asarray(image)
    nonwhite = float((array.min(axis=2) < 248).mean() * 100)
    image.save(jpeg_path, quality=88, optimize=True)
    png_path.unlink(missing_ok=True)
    print(
        f"  wrote {jpeg_path.name} {image.size[0]}x{image.size[1]} "
        f"nonwhite={nonwhite:.1f}% size={jpeg_path.stat().st_size / 1024:.0f}KB"
    )


def main() -> None:
    if not ODA_CONVERTER.exists():
        raise SystemExit(f"ODA File Converter not found: {ODA_CONVERTER}")
    if not SOURCE_DIRECTORY.exists():
        raise SystemExit(f"Source directory missing: {SOURCE_DIRECTORY}")

    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="aquifer-columns-") as tmp:
        tmp_path = Path(tmp)
        dwg_dir = tmp_path / "dwg"
        dxf_dir = tmp_path / "dxf"
        dwg_dir.mkdir()

        for source_name, safe_name, _ in JOBS:
            source = SOURCE_DIRECTORY / source_name
            if not source.exists():
                raise SystemExit(f"Missing source DWG: {source}")
            shutil.copy2(source, dwg_dir / safe_name)

        convert_dwg_dir_to_dxf(dwg_dir, dxf_dir)

        for _, safe_name, output_name in JOBS:
            render_dxf_to_jpeg(
                dxf_dir / safe_name.replace(".dwg", ".dxf"),
                OUTPUT_DIRECTORY / output_name,
            )


if __name__ == "__main__":
    main()
