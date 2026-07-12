# 含水层文档预览

原始资料位于本地 `src/Views/hanshuiceng/data/26-7吉大含水层资料/`（被 gitignore）。

网页预览版放在 `public/aquifer/documents/`，通过本目录的元数据模块按井 ID 查询。

当前已接入：

- `洋3` ← `华洋3井.jpg`（源文件实为 BMP 长图，已转为 JPEG 并压缩宽度）
- `石4井` / `ZK5` / `ZK6` ← 对应 DWG 综合柱状图（ODA File Converter → DXF → ezdxf 栅格导出）

复现柱状图导出见 `scripts/aquifer/export_column_diagrams.py`。
