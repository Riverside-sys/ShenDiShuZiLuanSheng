// Numeric regression checks independent of the UI and reconstruction library.
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const source = fs.readFileSync(
  new URL(
    "../src/Views/saltCave/subscenes/inversionVolume.ts",
    import.meta.url,
  ),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const { sampleGrid, gridStatistics } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const synthetic = {
  axes: [
    [2, 6],
    [10, 20],
    [-8, -2],
  ],
  shape: [2, 2, 2],
  values: [],
};
for (const x of synthetic.axes[0])
  for (const y of synthetic.axes[1])
    for (const z of synthetic.axes[2])
      synthetic.values.push([x + 2 * y - 3 * z, x * y * z, 5, 0, 0, 0]);
const result = sampleGrid(synthetic, [3, 13, -5]);
assert.ok(Math.abs(result[0] - 44) < 1e-10);
assert.ok(Math.abs(result[1] - 3 * 13 * -5) < 1e-10);
assert.equal(result[2], 5);
assert.equal(sampleGrid(synthetic, [7, 13, -5]), null);
assert.deepEqual(sampleGrid(synthetic, [6, 20, -2]), synthetic.values.at(-1));
const grid = JSON.parse(
  fs.readFileSync(
    new URL(
      "../public/models/salt-cave-horizontal/volume-grid.json",
      import.meta.url,
    ),
  ),
);
for (const threshold of [0.1, 0.5, 0.9]) {
  const stats = gridStatistics(grid, threshold, 4);
  const expected = grid.values.filter((r) => r[5] < threshold).length;
  assert.equal(stats.count, expected);
  assert.equal(
    stats.histogram.reduce((a, b) => a + b, 0),
    expected,
  );
  for (let x = 30; x <= 160; x += 0.5)
    assert.ok(sampleGrid(grid, [x, 40.25, -531.818])[5] < threshold);
  console.log(
    `C9=${threshold}: ${expected} interior samples; histogram and complete tour path verified`,
  );
}
// Raw lattice values must survive the browser volume export exactly.
for (const [x, y, z] of [
  [0, 0, 0],
  [50, 20, 20],
  [20, 10, 8],
]) {
  assert.deepEqual(
    sampleGrid(grid, [grid.axes[0][x], grid.axes[1][y], grid.axes[2][z]]),
    grid.values[(x * 21 + y) * 21 + z],
  );
}
console.log(
  "Anisotropic trilinear interpolation, boundary handling and grid ordering passed",
);
