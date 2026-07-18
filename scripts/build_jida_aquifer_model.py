#!/usr/bin/env python3
"""Build the Jilin University seismic-fence aquifer presentation model.

The three MATLAB matrices are treated as measured seismic amplitudes.  Spatial
placement of DZ5, the surface interpolation between lines and aquifer thickness
are explicitly presentation simulations; those assumptions are also written to
the generated metadata JSON.

This script writes GLB directly so the project does not gain a Blender/trimesh
runtime dependency.  Required Python packages are already used by the project
data workflow: numpy, scipy, Pillow and matplotlib.
"""

from __future__ import annotations

import io
import json
import math
import struct
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import matplotlib
import numpy as np
from PIL import Image
from scipy.io import loadmat
from scipy.ndimage import gaussian_filter1d, median_filter, uniform_filter1d


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "src/Views/hanshuiceng/data/26-7吉大含水层资料"
OUTPUT_DIR = ROOT / "src/Views/hanshuiceng/data/models"
MODEL_PATH = OUTPUT_DIR / "jida_aquifer_seismic.glb"
METADATA_PATH = OUTPUT_DIR / "jida_aquifer_seismic.metadata.json"

DEPTH_INTERVAL_M = 1.0
CDP_INTERVAL_M = 5.0
VERTICAL_EXAGGERATION = 2.5
SIMULATED_THICKNESS_M = 36.0
SIMULATED_DZ5_OFFSET_M = 3_000.0


@dataclass(frozen=True)
class SectionSpec:
    name: str
    intersection_trace: int
    seed_depth_m: int
    axis: str
    offset_m: float


SECTION_SPECS = (
    SectionSpec("DZ1", 652, 719, "x", 0.0),
    SectionSpec("DZ2", 743, 718, "z", 0.0),
    # DZ5 has no supplied survey geometry.  It is placed parallel to DZ1 and
    # intersects DZ2 at its centre trace solely for the presentation model.
    SectionSpec("DZ5", 1601, 724, "x", SIMULATED_DZ5_OFFSET_M),
)


def load_section(name: str) -> np.ndarray:
    payload = loadmat(SOURCE_DIR / f"{name}.mat")
    data = np.asarray(payload["data"], dtype=np.float32)
    if data.ndim != 2:
        raise ValueError(f"{name}: expected a 2-D matrix, got {data.shape}")
    return data


def high_pass(data: np.ndarray) -> np.ndarray:
    return data - gaussian_filter1d(data, sigma=8, axis=0, mode="nearest")


def section_texture_png(data: np.ndarray) -> tuple[bytes, np.ndarray]:
    """Return an AGC seismic PNG and the high-pass matrix used for picking."""
    filtered = high_pass(data)
    rms = np.sqrt(
        np.maximum(
            uniform_filter1d(filtered * filtered, size=61, axis=0, mode="nearest"),
            1.0,
        )
    )
    display = filtered / rms
    valid = np.abs(data) > 1.0e-6
    clip = float(np.percentile(np.abs(display[valid]), 99.0))
    normalized = np.clip(display / max(clip, 1.0e-6), -1.0, 1.0)
    rgba = np.asarray(matplotlib.colormaps["seismic"]((normalized + 1.0) * 0.5))
    rgba = np.asarray(np.rint(rgba * 255.0), dtype=np.uint8)
    rgba[..., 3] = np.where(valid, 244, 0).astype(np.uint8)
    image = Image.fromarray(rgba, mode="RGBA")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue(), filtered


def track_trough(
    filtered: np.ndarray,
    seed_trace_zero_based: int,
    seed_depth: int,
    depth_min: int = 620,
    depth_max: int = 840,
    max_jump: int = 3,
    smoothness: float = 0.28,
) -> np.ndarray:
    """Track a negative seismic phase from a fixed seed in both directions."""
    score = filtered[depth_min : depth_max + 1]
    scale = np.percentile(np.abs(score), 85.0, axis=0) + 1.0e-6
    score = np.clip(score / scale, -3.0, 3.0)
    depth_count, trace_count = score.shape
    seed = int(seed_depth - depth_min)
    path = np.zeros(trace_count, dtype=np.int32)
    path[seed_trace_zero_based] = seed
    shifts = np.arange(-max_jump, max_jump + 1, dtype=np.int16)

    def run(columns: list[int]) -> None:
        costs = np.full((len(columns), depth_count), np.inf, dtype=np.float32)
        back = np.zeros((len(columns), depth_count), dtype=np.int16)
        costs[0, seed] = score[seed, columns[0]]
        for step in range(1, len(columns)):
            previous = costs[step - 1]
            column = columns[step]
            for depth in range(depth_count):
                candidates = depth + shifts
                valid = (candidates >= 0) & (candidates < depth_count)
                candidate_depths = candidates[valid]
                candidate_shifts = shifts[valid].astype(np.float32)
                values = (
                    previous[candidate_depths]
                    + smoothness * candidate_shifts * candidate_shifts
                )
                selected = int(np.argmin(values))
                costs[step, depth] = score[depth, column] + values[selected]
                back[step, depth] = candidate_depths[selected]

        depth = int(np.argmin(costs[-1]))
        for step in range(len(columns) - 1, -1, -1):
            path[columns[step]] = depth
            if step:
                depth = int(back[step, depth])

    run(list(range(seed_trace_zero_based, trace_count)))
    run(list(range(seed_trace_zero_based, -1, -1)))
    return path.astype(np.float32) + float(depth_min)


def presentation_horizon(
    raw_path: np.ndarray,
    seed_trace_zero_based: int,
    target_seed_depth: float,
) -> np.ndarray:
    """Suppress trace-scale phase jumps before using a pick as a surface control."""
    smoothed = median_filter(raw_path, size=31, mode="nearest")
    smoothed = gaussian_filter1d(smoothed, sigma=45, mode="nearest")
    smoothed += target_seed_depth - float(smoothed[seed_trace_zero_based])
    return np.clip(smoothed, 630.0, 810.0).astype(np.float32)


class GlbBuilder:
    FLOAT = 5126
    UNSIGNED_INT = 5125
    ARRAY_BUFFER = 34962
    ELEMENT_ARRAY_BUFFER = 34963

    def __init__(self) -> None:
        self.binary = bytearray()
        self.buffer_views: list[dict[str, Any]] = []
        self.accessors: list[dict[str, Any]] = []
        self.images: list[dict[str, Any]] = []
        self.textures: list[dict[str, Any]] = []
        self.materials: list[dict[str, Any]] = []
        self.meshes: list[dict[str, Any]] = []
        self.nodes: list[dict[str, Any]] = []

    def _align(self) -> None:
        self.binary.extend(b"\x00" * ((-len(self.binary)) % 4))

    def add_blob(self, blob: bytes, target: int | None = None) -> int:
        self._align()
        offset = len(self.binary)
        self.binary.extend(blob)
        view: dict[str, Any] = {
            "buffer": 0,
            "byteOffset": offset,
            "byteLength": len(blob),
        }
        if target is not None:
            view["target"] = target
        self.buffer_views.append(view)
        return len(self.buffer_views) - 1

    def add_array(
        self,
        array: np.ndarray,
        component_type: int,
        accessor_type: str,
        target: int,
        include_bounds: bool = False,
    ) -> int:
        contiguous = np.ascontiguousarray(array)
        view = self.add_blob(contiguous.tobytes(), target)
        accessor: dict[str, Any] = {
            "bufferView": view,
            "componentType": component_type,
            "count": int(contiguous.shape[0]),
            "type": accessor_type,
        }
        if include_bounds:
            reshaped = contiguous.reshape(contiguous.shape[0], -1)
            accessor["min"] = reshaped.min(axis=0).astype(float).tolist()
            accessor["max"] = reshaped.max(axis=0).astype(float).tolist()
        self.accessors.append(accessor)
        return len(self.accessors) - 1

    def add_texture_material(self, name: str, png: bytes) -> int:
        view = self.add_blob(png)
        self.images.append(
            {"name": f"{name}_texture", "bufferView": view, "mimeType": "image/png"}
        )
        texture_index = len(self.textures)
        self.textures.append({"sampler": 0, "source": len(self.images) - 1})
        self.materials.append(
            {
                "name": f"{name}_material",
                "doubleSided": True,
                "alphaMode": "BLEND",
                "pbrMetallicRoughness": {
                    "baseColorTexture": {"index": texture_index},
                    "metallicFactor": 0.0,
                    "roughnessFactor": 1.0,
                },
                "extensions": {"KHR_materials_unlit": {}},
            }
        )
        return len(self.materials) - 1

    def add_color_material(self, name: str, rgba: list[float]) -> int:
        material: dict[str, Any] = {
            "name": name,
            "doubleSided": True,
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba,
                "metallicFactor": 0.0,
                "roughnessFactor": 0.72,
            },
            "extensions": {"KHR_materials_unlit": {}},
        }
        if rgba[3] < 1.0:
            material["alphaMode"] = "BLEND"
            material["alphaCutoff"] = 0.01
        self.materials.append(material)
        return len(self.materials) - 1

    def add_mesh(
        self,
        name: str,
        positions: np.ndarray,
        faces: np.ndarray,
        material: int,
        uvs: np.ndarray | None = None,
    ) -> int:
        positions = np.asarray(positions, dtype=np.float32)
        faces = np.asarray(faces, dtype=np.uint32).reshape(-1)
        attributes = {
            "POSITION": self.add_array(
                positions, self.FLOAT, "VEC3", self.ARRAY_BUFFER, True
            )
        }
        if uvs is not None:
            attributes["TEXCOORD_0"] = self.add_array(
                np.asarray(uvs, dtype=np.float32),
                self.FLOAT,
                "VEC2",
                self.ARRAY_BUFFER,
            )
        indices = self.add_array(
            faces.reshape(-1, 1),
            self.UNSIGNED_INT,
            "SCALAR",
            self.ELEMENT_ARRAY_BUFFER,
        )
        self.meshes.append(
            {
                "name": name,
                "primitives": [
                    {
                        "attributes": attributes,
                        "indices": indices,
                        "material": material,
                        "mode": 4,
                    }
                ],
            }
        )
        self.nodes.append({"name": name, "mesh": len(self.meshes) - 1})
        return len(self.nodes) - 1

    def write(self, path: Path) -> None:
        self._align()
        document = {
            "asset": {
                "version": "2.0",
                "generator": "build_jida_aquifer_model.py",
                "extras": {
                    "source": "Jilin University DZ1/DZ2/DZ5 seismic sections",
                    "simulationNotice": "DZ5 placement, interpolation and thickness are presentation simulations",
                },
            },
            "extensionsUsed": ["KHR_materials_unlit"],
            "scene": 0,
            "scenes": [{"name": "JidaAquiferScene", "nodes": list(range(len(self.nodes)))}],
            "nodes": self.nodes,
            "meshes": self.meshes,
            "materials": self.materials,
            "textures": self.textures,
            "images": self.images,
            "samplers": [
                {
                    "magFilter": 9729,
                    "minFilter": 9987,
                    "wrapS": 33071,
                    "wrapT": 33071,
                }
            ],
            "accessors": self.accessors,
            "bufferViews": self.buffer_views,
            "buffers": [{"byteLength": len(self.binary)}],
        }
        json_chunk = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode(
            "utf-8"
        )
        json_chunk += b" " * ((-len(json_chunk)) % 4)
        binary_chunk = bytes(self.binary)
        total_length = 12 + 8 + len(json_chunk) + 8 + len(binary_chunk)
        glb = bytearray(struct.pack("<4sII", b"glTF", 2, total_length))
        glb.extend(struct.pack("<I4s", len(json_chunk), b"JSON"))
        glb.extend(json_chunk)
        glb.extend(struct.pack("<I4s", len(binary_chunk), b"BIN\x00"))
        glb.extend(binary_chunk)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(glb)


def quad_for_section(spec: SectionSpec, shape: tuple[int, int]) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    depth_count, trace_count = shape
    start = (1 - spec.intersection_trace) * CDP_INTERVAL_M
    end = (trace_count - spec.intersection_trace) * CDP_INTERVAL_M
    bottom = -(depth_count - 1) * DEPTH_INTERVAL_M * VERTICAL_EXAGGERATION
    if spec.axis == "x":
        positions = np.array(
            [
                [start, 0.0, spec.offset_m],
                [end, 0.0, spec.offset_m],
                [end, bottom, spec.offset_m],
                [start, bottom, spec.offset_m],
            ],
            dtype=np.float32,
        )
    else:
        positions = np.array(
            [
                [spec.offset_m, 0.0, start],
                [spec.offset_m, 0.0, end],
                [spec.offset_m, bottom, end],
                [spec.offset_m, bottom, start],
            ],
            dtype=np.float32,
        )
    faces = np.array([[0, 2, 1], [0, 3, 2]], dtype=np.uint32)
    uvs = np.array([[0, 1], [1, 1], [1, 0], [0, 0]], dtype=np.float32)
    return positions, faces, uvs


def horizon_ribbon(
    spec: SectionSpec,
    horizon: np.ndarray,
    half_width_m: float = 14.0,
) -> tuple[np.ndarray, np.ndarray]:
    trace_indices = np.arange(horizon.size, dtype=np.float32)
    along = (trace_indices + 1.0 - spec.intersection_trace) * CDP_INTERVAL_M
    depth_y = -horizon * DEPTH_INTERVAL_M * VERTICAL_EXAGGERATION
    width_y = half_width_m * VERTICAL_EXAGGERATION
    if spec.axis == "x":
        offset = spec.offset_m + 24.0
        upper = np.column_stack((along, depth_y + width_y, np.full_like(along, offset)))
        lower = np.column_stack((along, depth_y - width_y, np.full_like(along, offset)))
    else:
        offset = spec.offset_m + 24.0
        upper = np.column_stack((np.full_like(along, offset), depth_y + width_y, along))
        lower = np.column_stack((np.full_like(along, offset), depth_y - width_y, along))
    positions = np.empty((horizon.size * 2, 3), dtype=np.float32)
    positions[0::2] = upper
    positions[1::2] = lower
    faces = []
    for index in range(horizon.size - 1):
        a = index * 2
        faces.extend(((a, a + 2, a + 1), (a + 1, a + 2, a + 3)))
    return positions, np.asarray(faces, dtype=np.uint32)


def interpolate_aquifer_surface(
    horizons: dict[str, np.ndarray],
    specs: dict[str, SectionSpec],
    shapes: dict[str, tuple[int, int]],
    nx: int = 96,
    nz: int = 76,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    x_values = np.linspace(-3_200.0, 8_000.0, nx, dtype=np.float32)
    z_values = np.linspace(-3_600.0, 5_200.0, nz, dtype=np.float32)

    def line_coordinates(spec: SectionSpec, trace_count: int) -> np.ndarray:
        return (
            np.arange(trace_count, dtype=np.float32) + 1.0 - spec.intersection_trace
        ) * CDP_INTERVAL_M

    x_dz1 = line_coordinates(specs["DZ1"], shapes["DZ1"][1])
    z_dz2 = line_coordinates(specs["DZ2"], shapes["DZ2"][1])
    x_dz5 = line_coordinates(specs["DZ5"], shapes["DZ5"][1])
    h1 = np.interp(x_values, x_dz1, horizons["DZ1"])
    h5 = np.interp(x_values, x_dz5, horizons["DZ5"])
    h2 = np.interp(z_values, z_dz2, horizons["DZ2"])

    result = np.empty((nz, nx), dtype=np.float32)
    base_at_x0 = np.empty(nz, dtype=np.float32)
    h1_zero = float(np.interp(0.0, x_values, h1))
    h5_zero = float(np.interp(0.0, x_values, h5))
    for iz, z in enumerate(z_values):
        blend = float(np.clip(z / SIMULATED_DZ5_OFFSET_M, 0.0, 1.0))
        horizontal = (1.0 - blend) * h1 + blend * h5
        if z < 0.0:
            horizontal = h1 + (z / SIMULATED_DZ5_OFFSET_M) * (h5 - h1) * 0.22
        elif z > SIMULATED_DZ5_OFFSET_M:
            horizontal = h5 + ((z - SIMULATED_DZ5_OFFSET_M) / SIMULATED_DZ5_OFFSET_M) * (h5 - h1) * 0.16
        base_at_x0[iz] = (1.0 - blend) * h1_zero + blend * h5_zero
        correction = (h2[iz] - base_at_x0[iz]) * np.exp(-((x_values / 3_200.0) ** 2))
        result[iz] = horizontal + correction

    xx, zz = np.meshgrid(x_values, z_values)
    return xx, zz, np.clip(result, 625.0, 825.0)


def grid_surface_mesh(
    xx: np.ndarray,
    zz: np.ndarray,
    depth: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    rows, columns = depth.shape
    positions = np.column_stack(
        (
            xx.reshape(-1),
            -depth.reshape(-1) * VERTICAL_EXAGGERATION,
            zz.reshape(-1),
        )
    ).astype(np.float32)
    faces: list[tuple[int, int, int]] = []
    for row in range(rows - 1):
        for column in range(columns - 1):
            a = row * columns + column
            b = a + 1
            c = a + columns
            d = c + 1
            faces.extend(((a, c, b), (b, c, d)))
    return positions, np.asarray(faces, dtype=np.uint32)


def aquifer_body_mesh(
    xx: np.ndarray,
    zz: np.ndarray,
    top_depth: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    thickness = SIMULATED_THICKNESS_M + 4.0 * np.sin(xx / 1_700.0) * np.cos(
        zz / 1_450.0
    )
    bottom_depth = top_depth + thickness
    top_positions, top_faces = grid_surface_mesh(xx, zz, top_depth)
    bottom_positions, bottom_faces = grid_surface_mesh(xx, zz, bottom_depth)
    vertex_count = top_positions.shape[0]
    positions = np.vstack((top_positions, bottom_positions))
    faces: list[tuple[int, int, int]] = [tuple(face) for face in top_faces]
    faces.extend(tuple((face + vertex_count)[::-1]) for face in bottom_faces)
    rows, columns = top_depth.shape

    perimeter: list[int] = []
    perimeter.extend(range(columns))
    perimeter.extend(row * columns + columns - 1 for row in range(1, rows))
    perimeter.extend(
        (rows - 1) * columns + column for column in range(columns - 2, -1, -1)
    )
    perimeter.extend(row * columns for row in range(rows - 2, 0, -1))
    for index, top_a in enumerate(perimeter):
        top_b = perimeter[(index + 1) % len(perimeter)]
        bottom_a = top_a + vertex_count
        bottom_b = top_b + vertex_count
        faces.extend(((top_a, bottom_a, top_b), (top_b, bottom_a, bottom_b)))
    return positions, np.asarray(faces, dtype=np.uint32), bottom_depth


def build() -> None:
    builder = GlbBuilder()
    sections: dict[str, np.ndarray] = {}
    filtered: dict[str, np.ndarray] = {}
    horizons: dict[str, np.ndarray] = {}
    pngs: dict[str, bytes] = {}
    specs = {spec.name: spec for spec in SECTION_SPECS}

    for spec in SECTION_SPECS:
        data = load_section(spec.name)
        png, high_pass_data = section_texture_png(data)
        raw_horizon = track_trough(
            high_pass_data,
            spec.intersection_trace - 1,
            spec.seed_depth_m,
        )
        horizon = presentation_horizon(
            raw_horizon,
            spec.intersection_trace - 1,
            float(spec.seed_depth_m),
        )
        sections[spec.name] = data
        filtered[spec.name] = high_pass_data
        horizons[spec.name] = horizon
        pngs[spec.name] = png

    # Enforce both simulated fence intersections so the rendered horizons meet.
    dz1_spec = specs["DZ1"]
    dz2_spec = specs["DZ2"]
    dz5_spec = specs["DZ5"]
    shared_depth = 720.0
    horizons["DZ1"] += shared_depth - horizons["DZ1"][dz1_spec.intersection_trace - 1]
    horizons["DZ2"] += shared_depth - horizons["DZ2"][dz2_spec.intersection_trace - 1]
    dz2_dz5_trace = int(
        round(dz2_spec.intersection_trace - 1 + SIMULATED_DZ5_OFFSET_M / CDP_INTERVAL_M)
    )
    dz5_shared_depth = float(horizons["DZ2"][dz2_dz5_trace])
    horizons["DZ5"] += dz5_shared_depth - horizons["DZ5"][dz5_spec.intersection_trace - 1]

    horizon_material = builder.add_color_material(
        "TargetHorizon_blue_trough", [1.0, 0.73, 0.08, 1.0]
    )
    body_material = builder.add_color_material(
        "SimulatedAquiferBody", [0.05, 0.72, 0.96, 0.24]
    )
    top_material = builder.add_color_material(
        "SimulatedAquiferTop", [0.18, 0.95, 0.78, 0.42]
    )

    for spec in SECTION_SPECS:
        texture_material = builder.add_texture_material(spec.name, pngs[spec.name])
        positions, faces, uvs = quad_for_section(spec, sections[spec.name].shape)
        builder.add_mesh(
            f"SEISMIC_{spec.name}", positions, faces, texture_material, uvs
        )
        ribbon_positions, ribbon_faces = horizon_ribbon(spec, horizons[spec.name])
        builder.add_mesh(
            f"HORIZON_{spec.name}",
            ribbon_positions,
            ribbon_faces,
            horizon_material,
        )

    shapes = {name: data.shape for name, data in sections.items()}
    xx, zz, top_depth = interpolate_aquifer_surface(horizons, specs, shapes)
    body_positions, body_faces, bottom_depth = aquifer_body_mesh(xx, zz, top_depth)
    builder.add_mesh("AQUIFER_BODY_SIMULATED", body_positions, body_faces, body_material)
    top_positions, top_faces = grid_surface_mesh(xx, zz, top_depth)
    builder.add_mesh("AQUIFER_TOP_SIMULATED", top_positions, top_faces, top_material)
    builder.write(MODEL_PATH)

    metadata = {
        "model": MODEL_PATH.name,
        "coordinateConvention": {
            "x": "local horizontal metres; DZ1/DZ5 CDP direction",
            "y": "negative depth metres multiplied by verticalExaggeration",
            "z": "local horizontal metres; DZ2 CDP direction",
        },
        "sampling": {
            "depthIntervalMetres": DEPTH_INTERVAL_M,
            "cdpIntervalMetres": CDP_INTERVAL_M,
            "depthIntervalStatus": "inferred from matrix size and supplied 0-1400 m preview; confirm with provider",
        },
        "verticalExaggeration": VERTICAL_EXAGGERATION,
        "measured": {
            spec.name: {
                "matrixShape": list(sections[spec.name].shape),
                "intersectionTrace": spec.intersection_trace,
                "trackedSeedDepthMetres": spec.seed_depth_m,
                "horizonDepthRangeMetres": [
                    round(float(horizons[spec.name].min()), 1),
                    round(float(horizons[spec.name].max()), 1),
                ],
            }
            for spec in SECTION_SPECS
        },
        "simulation": {
            "dz5Placement": "parallel to DZ1, 3000 m from DZ1, centred on DZ2",
            "surface": "smooth interpolation constrained by the three tracked presentation horizons",
            "thicknessMetres": SIMULATED_THICKNESS_M,
            "thicknessVariationMetres": 4.0,
            "usage": "research presentation only; not a geological interpretation deliverable",
        },
        "surfaceDepthRangeMetres": [
            round(float(top_depth.min()), 1),
            round(float(top_depth.max()), 1),
        ],
        "bodyBottomDepthRangeMetres": [
            round(float(bottom_depth.min()), 1),
            round(float(bottom_depth.max()), 1),
        ],
        "nodes": {
            "sections": [f"SEISMIC_{spec.name}" for spec in SECTION_SPECS],
            "horizons": [f"HORIZON_{spec.name}" for spec in SECTION_SPECS],
            "body": ["AQUIFER_BODY_SIMULATED", "AQUIFER_TOP_SIMULATED"],
        },
    }
    METADATA_PATH.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {MODEL_PATH} ({MODEL_PATH.stat().st_size / 1024 / 1024:.2f} MiB)")
    print(f"Wrote {METADATA_PATH}")


if __name__ == "__main__":
    build()
