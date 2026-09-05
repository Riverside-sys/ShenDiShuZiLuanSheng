/** Raw Cartesian grid; C-order samples, C4..C9 in each row. No inferred units. */
export interface VolumeGrid {
  axes: number[][];
  shape: number[];
  values: number[][];
}
export function sampleGrid(grid: VolumeGrid, xyz: number[]): number[] | null {
  const lo: number[] = [],
    t: number[] = [];
  for (let k = 0; k < 3; k++) {
    const a = grid.axes[k],
      v = xyz[k];
    if (v < a[0] - 1e-6 || v > a[a.length - 1] + 1e-6) return null;
    let l = 0,
      r = a.length - 1;
    while (r - l > 1) {
      const m = (l + r) >> 1;
      if (a[m] <= v) l = m;
      else r = m;
    }
    lo.push(l);
    t.push(Math.max(0, Math.min(1, (v - a[l]) / (a[l + 1] - a[l]))));
  }
  const result = [0, 0, 0, 0, 0, 0];
  for (let dx = 0; dx < 2; dx++)
    for (let dy = 0; dy < 2; dy++)
      for (let dz = 0; dz < 2; dz++) {
        const w =
          (dx ? t[0] : 1 - t[0]) *
          (dy ? t[1] : 1 - t[1]) *
          (dz ? t[2] : 1 - t[2]);
        const row =
          grid.values[
            ((lo[0] + dx) * grid.shape[1] + lo[1] + dy) * grid.shape[2] +
              lo[2] +
              dz
          ];
        for (let f = 0; f < 6; f++) result[f] += row[f] * w;
      }
  return result;
}
export function fieldColor(t: number): number[] {
  const stops = [
    [49, 91, 207],
    [28, 190, 216],
    [114, 229, 193],
    [248, 204, 110],
    [245, 113, 75],
  ];
  const x = Math.max(0, Math.min(1, t)) * 4,
    i = Math.min(3, Math.floor(x)),
    f = x - i;
  return stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f));
}
export function normalized(value: number, range: number[]): number {
  return range[1] - range[0] > Math.max(1, Math.abs(range[1])) * 1e-6
    ? (value - range[0]) / (range[1] - range[0])
    : 0.5;
}
export function gridStatistics(
  grid: VolumeGrid,
  threshold: number,
  field: number,
) {
  const values: number[] = [],
    areas: number[] = [],
    means: number[] = [];
  const widths = grid.axes
    .slice(0, 2)
    .map((a) =>
      a.map(
        (_, i) =>
          (a[Math.min(a.length - 1, i + 1)] - a[Math.max(0, i - 1)]) /
          (i === 0 || i === a.length - 1 ? 1 : 2),
      ),
    );
  for (let z = 0; z < grid.shape[2]; z++) {
    let area = 0,
      sum = 0,
      count = 0;
    for (let x = 0; x < grid.shape[0]; x++)
      for (let y = 0; y < grid.shape[1]; y++) {
        const row = grid.values[(x * grid.shape[1] + y) * grid.shape[2] + z];
        if (row[5] >= threshold) continue;
        area += widths[0][x] * widths[1][y];
        sum += row[field];
        count++;
        values.push(row[field]);
      }
    areas.push(area);
    means.push(count ? sum / count : NaN);
  }
  const range = values.length
    ? [Math.min(...values), Math.max(...values)]
    : [0, 0];
  const histogram = Array<number>(10).fill(0);
  for (const v of values)
    histogram[Math.min(9, Math.floor(normalized(v, range) * 10))]++;
  return { areas, means, range, histogram, count: values.length };
}
