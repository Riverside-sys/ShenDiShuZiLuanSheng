"""Reconstruct a provisional C9 isosurface; never infer physical units.

Run: python scripts/build_salt_cave_model.py
Dependencies: numpy scipy scikit-image trimesh
"""
from pathlib import Path
import hashlib
import json
import numpy as np
from scipy.interpolate import RegularGridInterpolator
from scipy.ndimage import label
from skimage.measure import marching_cubes
import trimesh

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src/Views/saltCave/data/盐穴/7.水平腔体.dat'
OUT = ROOT / 'public/models/salt-cave-horizontal'


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':'), allow_nan=False), encoding='utf-8')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    data = np.loadtxt(SOURCE)
    assert data.ndim == 2 and data.shape[1] == 9 and np.isfinite(data).all()
    axes = [np.unique(data[:, i]) for i in range(3)]
    shape = tuple(len(a) for a in axes)
    ids = tuple(np.searchsorted(axes[i], data[:, i]) for i in range(3))
    assert np.prod(shape) == len(data)
    assert len(np.unique(np.ravel_multi_index(ids, shape))) == len(data)
    grid = np.empty((*shape, 6))
    grid[ids] = data[:, 3:]
    scalar = grid[..., 5]
    # C-order: index = ((ix * ny) + iy) * nz + iz; six raw fields per sample.
    write_json(OUT / 'volume-grid.json', dict(axes=[a.tolist() for a in axes],
               shape=list(shape), columns=[4, 5, 6, 7, 8, 9], values=grid.reshape(-1, 6).tolist()))
    origin = np.array([(a[0] + a[-1]) / 2 for a in axes])
    stats = []
    for i in range(9):
        stats.append(dict(column=i+1, min=float(data[:, i].min()), max=float(data[:, i].max()),
                          nonzero=int(np.count_nonzero(data[:, i])), unit='unknown'))
    variants = []
    for level in (0.1, 0.5, 0.9):
        mask = scalar < level
        assert all(not np.take(mask, side, axis=k).any() for k in range(3) for side in (0, -1)), 'Surface intersects domain boundary'
        vertices, faces, _, _ = marching_cubes(scalar, level, gradient_direction='ascent', allow_degenerate=False)
        # Map fractional grid indices through actual coordinates, preserving printed rounding.
        xyz = np.column_stack([np.interp(vertices[:, i], np.arange(len(axes[i])), axes[i]) for i in range(3)])
        properties = RegularGridInterpolator(axes, grid)(xyz)
        local = xyz - origin
        # Right-handed Z-up -> glTF Y-up: (X,Y,Z) -> (X,Z,-Y).
        positions = local[:, [0, 2, 1]] * [1, 1, -1]
        mesh = trimesh.Trimesh(vertices=positions, faces=faces, process=False)
        mesh.fix_normals()
        assert mesh.is_watertight and mesh.is_winding_consistent and mesh.volume > 0
        components = len(mesh.split(only_watertight=False))
        name = f'cave-c9-{level:.1f}'
        mesh.metadata = dict(source=SOURCE.name, hypothesis='C9 low values represent cavity; unconfirmed',
                             threshold=level, coordinate_unit='unknown', source_origin=origin.tolist())
        mesh.visual.vertex_colors = np.tile([48, 188, 210, 255], (len(xyz), 1))
        mesh.export(OUT / f'{name}.glb')
        # Separate mesh+attributes payload keeps precise vertex correspondence for picking/coloring.
        write_json(OUT / f'{name}.json', dict(positions=positions.tolist(), indices=mesh.faces.ravel().tolist(),
                    sourceCoordinates=xyz.tolist(), attributes=properties.tolist(), columns=[4, 5, 6, 7, 8, 9]))
        entry = dict(threshold=level, file=name, vertices=len(xyz), triangles=len(mesh.faces),
                     touchesDomainBoundary=bool(any(np.isclose(xyz[:, k], axes[k][side], atol=1e-5).any() for k in range(3) for side in (0, -1))),
                     watertight=bool(mesh.is_watertight), components=components, gridComponents=int(label(mask)[1]),
                     volume=float(mesh.volume), area=float(mesh.area), sourceBounds=[xyz.min(0).tolist(), xyz.max(0).tolist()],
                     dimensions=np.ptp(xyz, axis=0).tolist())
        variants.append(entry)
    metadata = dict(source=SOURCE.name, sha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        provenance='Third-party dissolution simulation/inversion, not measured geometry',
        rows=len(data), gridShape=list(shape), coordinateUnit='unknown', columns=stats,
        axes=[a.tolist() for a in axes], origin=origin.tolist(),
        transform='viewer=(sourceX-originX, sourceZ-originZ, -(sourceY-originY)); no scaling',
        vectorNormMaxAbsoluteError=float(np.max(abs(np.linalg.norm(data[:, 3:6], axis=1)-data[:, 6]))),
        assumption='C1-C3 are Cartesian coordinates; C9 < threshold is cavity; all physical meanings and units unconfirmed',
        method='Lewiner marching cubes on original grid; no smoothing, extrapolation or artificial closure; trilinear attribute interpolation',
        defaultThreshold=0.5, variants=variants)
    write_json(OUT / 'metadata.json', metadata)
    # Preserve every original sample, including internal fields absent from the surface.
    np.savetxt(OUT / 'source-grid.csv', data, delimiter=',', header=','.join(f'C{i}' for i in range(1, 10)), comments='', fmt='%.8g')
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
