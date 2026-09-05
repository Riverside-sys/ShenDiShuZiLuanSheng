<template>
  <div class="inversion-view">
    <header>
      <div>
        <small>SALT CAVERN / VOLUMETRIC EXPLORER</small>
        <h1>水平盐穴 <span>三维形态分析</span></h1>
      </div>
      <div class="header-actions">
        <span class="status-dot" /> 单腔连通 · 三维模型
        <button @click="router.push('/saltCave')">返回盐穴场景 ↗</button>
      </div>
    </header>
    <div class="dashboard">
      <aside class="left-column">
        <section class="panel">
          <h2><i />腔体几何概览 <small>GEOMETRY</small></h2>
          <div class="metrics">
            <div>
              <strong>{{ ((variant?.volume || 0) / 10000).toFixed(2) }}</strong
              ><span>体积 / 万单位³</span>
            </div>
            <div>
              <strong>{{ ((variant?.area || 0) / 10000).toFixed(2) }}</strong
              ><span>表面积 / 万单位²</span>
            </div>
          </div>
          <div
            class="dimensions"
            v-for="(d, i) in variant?.dimensions"
            :key="i"
          >
            <span>{{ ["长度 C1", "宽度 C2", "高度 C3"][i] }}</span>
            <div>
              <b
                :style="{
                  width: `${(d / Math.max(...variant!.dimensions)) * 100}%`,
                }"
              />
            </div>
            <em>{{ d.toFixed(2) }}</em>
          </div>
          <div class="subline">
            {{ variant?.triangles.toLocaleString() }} 三角面
            <span>51 × 21 × 21 网格</span>
          </div>
        </section>
        <section class="panel">
          <h2><i />沿高程的截面积 <small>SECTION AREA</small></h2>
          <InversionChart :option="areaChart" />
          <p class="caption">按边界系数计算的网格截面积 · 单位²</p>
        </section>
        <section class="panel">
          <h2><i />边界阈值敏感性 <small>SENSITIVITY</small></h2>
          <InversionChart :option="sensitivityChart" />
          <div class="inline-control">
            <label for="threshold">边界系数阈值</label
            ><select
              id="threshold"
              v-model.number="threshold"
              :disabled="busy"
              @change="loadMesh"
            >
              <option :value="0.1">0.1 · 内侧</option>
              <option :value="0.5">0.5 · 默认</option>
              <option :value="0.9">0.9 · 外侧</option>
            </select>
          </div>
          <p class="caption">比较不同边界范围下的腔体体积。</p>
        </section>
      </aside>
      <main class="stage">
        <div class="stage-top">
          <span class="stage-tag">{{ modeLabel }}</span
          ><span>原比例 / C3 朝上</span>
        </div>
        <div
          ref="viewport"
          class="viewport"
          @pointerdown="rememberPointer"
          @pointermove="lookAround"
          @click="pick"
        />
        <div v-if="busy || error" class="load-state" role="status">
          {{ error || "正在载入体网格与模型…" }}
        </div>
        <div class="structure-note" v-if="mode === 'outside'">
          <b>02</b>
          <div>竖向井筒<small>双井筒结构 · 腔体纵向连接</small></div>
        </div>
        <div v-if="mode !== 'outside'" class="tour-note">
          <span>{{
            mode === "inside"
              ? "拖动环视腔内 · Esc 返回外部"
              : "沿腔内中心路线前进"
          }}</span>
          <div class="progress">
            <b :style="{ width: `${tourProgress}%` }" />
          </div>
          <small>穿壁入场为演示动画，不代表真实可通行入口</small>
        </div>
        <div v-if="picked" class="picked-note">
          <button @click="picked = undefined">×</button
          ><b>{{ picked.kind }}查询</b
          ><small
            >C1 {{ picked.xyz[0].toFixed(2) }} / C2
            {{ picked.xyz[1].toFixed(2) }} / C3
            {{ picked.xyz[2].toFixed(2) }}</small
          ><span
            >{{ fieldNames[field] }} =
            {{ picked.values[field].toExponential(4) }}</span
          >
        </div>
        <div class="stage-bottom">
          <span>{{
            clipping
              ? `剖切位置 C${axis + 1} = ${cutCoordinate.toFixed(2)}`
              : "完整腔体表面"
          }}</span
          ><span>{{
            mode === "outside"
              ? "拖动旋转 · 滚轮缩放 · 点击查询"
              : "内部视角 · 辅助照明"
          }}</span>
        </div>
      </main>
      <aside class="right-column">
        <section class="panel">
          <h2><i />腔体属性场 <small>SCALAR FIELD</small></h2>
          <div class="inline-control">
            <label for="field">当前字段</label
            ><select id="field" v-model.number="field" @change="refreshField">
              <option v-for="n in 6" :key="n" :value="n - 1">
                {{ fieldNames[n - 1] }}
              </option>
            </select>
          </div>
          <label class="check"
            ><input type="checkbox" v-model="colored" @change="colorMesh" />
            表面属性着色</label
          >
          <div class="gradient" />
          <div class="legend">
            <span>{{ fieldRange[0].toExponential(2) }}</span
            ><span>{{ fieldRange[1].toExponential(2) }}</span>
          </div>
          <p class="caption">腔内采样与腔壁属性共用色标</p>
          <InversionChart :option="histogramChart" />
          <p class="caption">
            腔内原始采样点的数值分布 ·
            {{ statistics?.count.toLocaleString() || "—" }} 点
          </p>
        </section>
        <section class="panel">
          <h2><i />属性随高程变化 <small>HEIGHT PROFILE</small></h2>
          <InversionChart :option="profileChart" />
          <p class="caption">
            各 C3 层腔内采样点的 {{ fieldNames[field] }} 算术平均
          </p>
        </section>
        <section class="panel provenance">
          <h2><i />数据解释与查询</h2>
          <p>
            腔体呈横向连通形态，上部连接两处竖向井筒。可通过剖切和内部漫游观察腔壁形态。
          </p>
          <p v-if="variant?.touchesDomainBoundary" class="warning">
            当前边界范围已到达数据顶部。
          </p>
          <div v-if="picked" class="property-grid">
            <span v-for="(v, i) in picked.values" :key="i"
              >{{ fieldNames[i] }} <b>{{ v.toExponential(2) }}</b></span
            >
          </div>
          <p v-else class="caption">点击腔壁，可查询六列插值属性。</p>
          <nav>
            <a :href="asset(`${variant?.file}.glb`)" download>GLB 模型 ↗</a
            ><a :href="asset('source-grid.csv')" download>原始属性 ↗</a>
          </nav>
        </section>
      </aside>
    </div>
    <section class="control-dock">
      <div class="tour-controls">
        <button
          class="primary"
          :disabled="busy || mode === 'entering' || mode === 'leaving'"
          @click="
            mode === 'outside'
              ? enterCave()
              : mode === 'touring'
                ? pauseTour()
                : enterCave()
          "
        >
          {{
            mode === "outside"
              ? "▷ 进入盐穴"
              : mode === "touring"
                ? "Ⅱ 暂停漫游"
                : mode === "inside"
                  ? "▷ 重新漫游"
                  : "视角过渡中"
          }}</button
        ><button :disabled="busy" @click="resetView">
          {{ mode === "outside" ? "重置视角" : "返回外部" }}
        </button>
      </div>
      <div class="cut-controls">
        <label class="check"
          ><input
            type="checkbox"
            v-model="clipping"
            :disabled="busy || mode !== 'outside'"
            @change="updateSection"
          />启用剖切</label
        ><select
          aria-label="剖切方向"
          v-model.number="axis"
          :disabled="!clipping"
          @change="changeAxis"
        >
          <option :value="0">C1 · 横向</option>
          <option :value="1">C2 · 纵向</option>
          <option :value="2">C3 · 水平</option></select
        ><label class="slider-label"
          ><span
            >轴向切去 <b>{{ cut }}%</b></span
          ><input
            aria-label="切去范围"
            type="range"
            min="0"
            max="100"
            step="1"
            v-model.number="cut"
            :disabled="!clipping"
            @input="updateSection" /></label
        ><button
          :disabled="!clipping"
          @click="
            reverse = !reverse;
            updateSection();
          "
        >
          {{ reverse ? "低值侧 →" : "← 高值侧" }}
        </button>
      </div>
      <div class="display-controls">
        <label class="check"
          ><input
            type="checkbox"
            v-model="wireframe"
            @change="colorMesh"
          />线框</label
        >
      </div>
    </section>
    <footer>
      <span class="warning">水平盐穴 · 三维空间分析</span
      ><span>原始坐标比例 · 腔壁属性查询 · 三方向空腔剖切</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";
import * as THREE from "three";
import type { EChartsOption } from "echarts";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import InversionChart from "./InversionChart.vue";
import {
  sampleGrid,
  gridStatistics,
  fieldColor,
  normalized,
  type VolumeGrid,
} from "./inversionVolume";
interface Variant {
  threshold: number;
  file: string;
  dimensions: number[];
  volume: number;
  area: number;
  triangles: number;
  components: number;
  touchesDomainBoundary: boolean;
  sourceBounds: number[][];
}
interface Metadata {
  variants: Variant[];
  origin: number[];
}
interface Payload {
  positions: number[][];
  indices: number[];
  sourceCoordinates: number[][];
  attributes: number[][];
}
type Mode = "outside" | "entering" | "touring" | "inside" | "leaving";
const fieldNames = [
  "X 向场分量",
  "Y 向场分量",
  "Z 向场分量",
  "矢量模长",
  "标量场强度",
  "边界系数",
];
const router = useRouter(),
  viewport = ref<HTMLDivElement>(),
  metadata = shallowRef<Metadata>(),
  volume = shallowRef<VolumeGrid>();
const threshold = ref(0.5),
  field = ref(4),
  colored = ref(false),
  wireframe = ref(false),
  busy = ref(true),
  error = ref("");
const clipping = ref(false),
  axis = ref(1),
  cut = ref(50),
  reverse = ref(true);
const mode = ref<Mode>("outside"),
  tourProgress = ref(0);
const picked = ref<{ xyz: number[]; values: number[]; kind: string }>();
const variant = computed(() =>
  metadata.value?.variants.find((v) => v.threshold === threshold.value),
);
const statistics = computed(() =>
  volume.value
    ? gridStatistics(volume.value, threshold.value, field.value)
    : undefined,
);
const fieldRange = ref([0, 1]);
const cutCoordinate = computed(() => {
  const b = variant.value?.sourceBounds;
  if (!b) return 0;
  return reverse.value
    ? b[0][axis.value] +
        ((b[1][axis.value] - b[0][axis.value]) * cut.value) / 100
    : b[1][axis.value] -
        ((b[1][axis.value] - b[0][axis.value]) * cut.value) / 100;
});
const modeLabel = computed(
  () =>
    ({
      outside: "外部观察 / EXTERIOR",
      entering: "进入腔体 / ENTERING",
      touring: "内部漫游 / TOUR",
      inside: "腔内环视 / INTERIOR",
      leaving: "返回外部 / EXIT",
    })[mode.value],
);
const asset = (file: string) =>
  `${import.meta.env.BASE_URL}models/salt-cave-horizontal/${file}`;
const chartBase = {
  animationDuration: 300,
  grid: { left: 48, right: 16, top: 28, bottom: 34 },
  textStyle: { color: "#86a5b8", fontSize: 10 },
  tooltip: {
    trigger: "axis" as const,
    backgroundColor: "#0c2232",
    borderColor: "#285167",
    textStyle: { color: "#d9edf7" },
  },
  xAxis: {
    type: "value" as const,
    axisLabel: { color: "#86a5b8", fontSize: 10 },
    splitLine: { lineStyle: { color: "#193142" } },
  },
  yAxis: {
    type: "value" as const,
    axisLabel: { color: "#86a5b8", fontSize: 10 },
    splitLine: { lineStyle: { color: "#193142" } },
  },
};
const areaChart = computed<EChartsOption>(() => ({
  ...chartBase,
  xAxis: {
    ...chartBase.xAxis,
    name: "面积",
    nameLocation: "middle",
    nameGap: 18,
  },
  yAxis: { ...chartBase.yAxis, name: "C3", scale: true },
  series: [
    {
      type: "line",
      showSymbol: false,
      lineStyle: { color: "#49d6d0", width: 2 },
      areaStyle: { color: "#1d7178", opacity: 0.2 },
      data:
        volume.value?.axes[2].map((z, i) => [
          statistics.value?.areas[i] || 0,
          z,
        ]) || [],
    },
  ],
}));
const profileChart = computed<EChartsOption>(() => ({
  ...chartBase,
  xAxis: {
    ...chartBase.xAxis,
    axisLabel: { fontSize: 9, formatter: (v: number) => v.toExponential(1) },
  },
  yAxis: { ...chartBase.yAxis, name: "C3", scale: true },
  series: [
    {
      type: "line",
      showSymbol: false,
      lineStyle: { color: "#dfb971", width: 2 },
      data:
        volume.value?.axes[2].map((z, i) => [
          Number.isFinite(statistics.value?.means[i])
            ? statistics.value!.means[i]
            : null,
          z,
        ]) || [],
    },
  ],
}));
const sensitivityChart = computed<EChartsOption>(() => ({
  ...chartBase,
  xAxis: {
    type: "category",
    data: ["0.1", "0.5", "0.9"],
    axisLabel: { color: "#86a5b8" },
  },
  yAxis: { ...chartBase.yAxis, name: "万单位³" },
  series: [
    {
      type: "bar",
      barWidth: 28,
      label: {
        show: true,
        position: "top",
        color: "#b9dfeb",
        formatter: (p: any) => Number(p.value).toFixed(2),
      },
      data:
        metadata.value?.variants.map((v) => ({
          value: v.volume / 10000,
          itemStyle: {
            color: v.threshold === threshold.value ? "#49d6d0" : "#285572",
            borderRadius: [3, 3, 0, 0],
          },
        })) || [],
    },
  ],
}));
const histogramChart = computed<EChartsOption>(() => ({
  ...chartBase,
  grid: { left: 40, right: 12, top: 18, bottom: 22 },
  xAxis: {
    type: "category",
    data: statistics.value?.histogram.map((_, i) => `${i + 1}`) || [],
    axisLabel: { fontSize: 9 },
    name: "区间",
  },
  yAxis: { ...chartBase.yAxis, name: "点数" },
  series: [
    {
      type: "bar",
      barCategoryGap: "12%",
      data:
        statistics.value?.histogram.map((v, i) => ({
          value: v,
          itemStyle: { color: `rgb(${fieldColor(i / 9).join(",")})` },
        })) || [],
    },
  ],
  tooltip: {
    ...chartBase.tooltip,
    formatter: (params: any) => {
      const p = params[0];
      const r = statistics.value?.range || [0, 0],
        step = (r[1] - r[0]) / 10;
      return `${(r[0] + p.dataIndex * step).toExponential(2)} ～ ${(r[0] + (p.dataIndex + 1) * step).toExponential(2)}<br/>${p.value} 个采样点`;
    },
  },
}));
let renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  scene: THREE.Scene;
let mesh:
    THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | undefined,
  payload: Payload | undefined;
let gridHelper: THREE.GridHelper,
  headlamp: THREE.PointLight,
  observer: ResizeObserver,
  frame = 0,
  generation = 0,
  disposed = false;
let transition:
  | {
      start: number;
      duration: number;
      from: THREE.Vector3;
      to: THREE.Vector3;
      fromTarget: THREE.Vector3;
      toTarget: THREE.Vector3;
      done: () => void;
    }
  | undefined;
let tourStart = 0,
  yaw = 0,
  pitch = 0,
  previousClip = false;
const plane = new THREE.Plane(),
  abort = new AbortController(),
  down = new THREE.Vector2(),
  lastPointer = new THREE.Vector2();
const rawDirections = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(0, 1, 0),
];
function toWorld(xyz: number[]) {
  const o = metadata.value!.origin;
  return new THREE.Vector3(xyz[0] - o[0], xyz[2] - o[2], -(xyz[1] - o[1]));
}
async function getJson<T>(file: string): Promise<T> {
  const r = await fetch(asset(file), { signal: abort.signal });
  if (!r.ok) throw new Error(`加载失败 ${file} (${r.status})`);
  return r.json();
}
function outsidePose() {
  return {
    position: new THREE.Vector3(195, 115, 230),
    target: new THREE.Vector3(0, -14, 0),
  };
}
function travel(
  position: THREE.Vector3,
  target: THREE.Vector3,
  duration: number,
  done: () => void,
) {
  controls.enabled = false;
  transition = {
    start: performance.now(),
    duration,
    from: camera.position.clone(),
    to: position,
    fromTarget: controls.target.clone(),
    toTarget: target,
    done,
  };
}
function finishOutside() {
  mode.value = "outside";
  controls.enabled = true;
  controls.enableZoom = true;
  gridHelper.visible = true;
  headlamp.intensity = 0;
  if (mesh) {
    mesh.material.transparent = false;
    mesh.material.opacity = 1;
  }
  clipping.value = previousClip;
  updateSection();
}
function resetView() {
  if (!camera) return;
  const p = outsidePose();
  if (mode.value === "outside") {
    transition = undefined;
    controls.enabled = true;
    camera.position.copy(p.position);
    controls.target.copy(p.target);
    controls.update();
    return;
  }
  mode.value = "leaving";
  if (mesh) {
    mesh.material.transparent = true;
    mesh.material.opacity = 0.25;
  }
  travel(p.position, p.target, 1400, finishOutside);
}
function enterCave() {
  if (!volume.value || !mesh || busy.value) return;
  // Verify the full demonstration centerline against the current raw scalar grid.
  for (let x = 30; x <= 160; x += 1) {
    const v = sampleGrid(volume.value, [x, 40.25, -531.818]);
    if (!v || v[5] >= threshold.value) {
      error.value = "当前腔体不支持预设内部路线";
      return;
    }
  }
  if (mode.value === "outside") previousClip = clipping.value;
  clipping.value = false;
  updateSection();
  picked.value = undefined;
  mode.value = "entering";
  tourProgress.value = 0;
  gridHelper.visible = false;
  mesh.material.transparent = true;
  mesh.material.opacity = 0.18;
  headlamp.intensity = 1100;
  travel(
    toWorld([30, 40.25, -531.818]),
    toWorld([45, 40.25, -531.818]),
    2200,
    () => {
      if (!mesh) return;
      mesh.material.transparent = false;
      mesh.material.opacity = 1;
      mode.value = "touring";
      tourStart = performance.now();
    },
  );
}
function pauseTour() {
  mode.value = "inside";
  const d = controls.target.clone().sub(camera.position).normalize();
  yaw = Math.atan2(d.z, d.x);
  pitch = Math.asin(d.y);
}
function rememberPointer(e: PointerEvent) {
  down.set(e.clientX, e.clientY);
  lastPointer.copy(down);
}
function lookAround(e: PointerEvent) {
  if (mode.value !== "inside" || !e.buttons) return;
  yaw += (e.clientX - lastPointer.x) * 0.004;
  pitch = THREE.MathUtils.clamp(
    pitch - (e.clientY - lastPointer.y) * 0.004,
    -1.3,
    1.3,
  );
  lastPointer.set(e.clientX, e.clientY);
  const d = new THREE.Vector3(
    Math.cos(pitch) * Math.cos(yaw),
    Math.sin(pitch),
    Math.cos(pitch) * Math.sin(yaw),
  );
  controls.target.copy(camera.position).addScaledVector(d, 12);
  camera.lookAt(controls.target);
}
function escape(e: KeyboardEvent) {
  if (e.key === "Escape" && mode.value !== "outside") resetView();
}
async function loadMesh() {
  const current = ++generation;
  busy.value = true;
  error.value = "";
  picked.value = undefined;
  if (mode.value !== "outside") {
    transition = undefined;
    finishOutside();
    resetView();
  }
  try {
    const data = await getJson<Payload>(
      `cave-c9-${threshold.value.toFixed(1)}.json`,
    );
    if (disposed || current !== generation) return;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(data.positions.flat(), 3),
    );
    geometry.setIndex(data.indices);
    geometry.computeVertexNormals();
    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    payload = data;
    mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        roughness: 0.72,
        metalness: 0.08,
        side: THREE.DoubleSide,
      }),
    );
    scene.add(mesh);
    refreshField();
  } catch (e) {
    if (!disposed && current === generation) error.value = String(e);
  } finally {
    if (!disposed && current === generation) busy.value = false;
  }
}
function refreshField() {
  if (!payload) return;
  const values = payload.attributes.map((r) => r[field.value]);
  const r = statistics.value?.range || [0, 0];
  fieldRange.value = [Math.min(r[0], ...values), Math.max(r[1], ...values)];
  colorMesh();
  updateSection();
}
function colorMesh() {
  if (!mesh || !payload) return;
  mesh.material.wireframe = wireframe.value;
  mesh.material.vertexColors = colored.value;
  mesh.material.color.set(colored.value ? "#ffffff" : "#45c8d3");
  if (colored.value) {
    const colors: number[] = [];
    const c = new THREE.Color();
    for (const r of payload.attributes) {
      const rgb = fieldColor(normalized(r[field.value], fieldRange.value));
      c.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace);
      colors.push(c.r, c.g, c.b);
    }
    mesh.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3),
    );
  }
  mesh.material.needsUpdate = true;
}
function changeAxis() {
  reverse.value = axis.value !== 2;
  updateSection();
  if (clipping.value) {
    const p = outsidePose();
    if (axis.value === 0) p.position.set(-230, 100, 185);
    travel(p.position, p.target, 600, () => {
      controls.enabled = true;
    });
  }
}
function updateSection() {
  if (!mesh || !volume.value || !metadata.value || !variant.value) return;
  picked.value = undefined;
  mesh.visible = !(clipping.value && cut.value === 100);
  mesh.material.clippingPlanes = clipping.value && cut.value > 0 ? [plane] : [];
  mesh.material.needsUpdate = true;
  if (!clipping.value) return;
  const k = axis.value,
    sign = reverse.value ? 1 : -1;
  plane.normal.copy(rawDirections[k]).multiplyScalar(sign);
  plane.constant = sign * (metadata.value.origin[k] - cutCoordinate.value);
  // Clip the shell only: no cap or field plane obscures the cavity.
}

function pick(e: MouseEvent) {
  if (
    !mesh ||
    !mesh.visible ||
    !payload ||
    busy.value ||
    mode.value !== "outside" ||
    down.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 5
  )
    return;
  const rect = renderer.domElement.getBoundingClientRect(),
    ray = new THREE.Raycaster();
  ray.setFromCamera(
    new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      (-(e.clientY - rect.top) / rect.height) * 2 + 1,
    ),
    camera,
  );
  const hits = ray.intersectObject(mesh);
  picked.value = undefined;
  for (const hit of hits) {
    if (clipping.value && plane.distanceToPoint(hit.point) < -1e-5) continue;
    if (!hit.face) continue;
    const ids = [hit.face.a, hit.face.b, hit.face.c],
      points = ids.map((i) =>
        new THREE.Vector3().fromArray(payload!.positions[i]),
      );
    const w = THREE.Triangle.getBarycoord(
      hit.point,
      points[0],
      points[1],
      points[2],
      new THREE.Vector3(),
    )?.toArray();
    if (!w) continue;
    const interp = (rows: number[][]) =>
      rows[0].map((_, c) =>
        ids.reduce((sum, id, i) => sum + rows[id][c] * w[i], 0),
      );
    picked.value = {
      xyz: interp(payload.sourceCoordinates),
      values: interp(payload.attributes),
      kind: "表面",
    };
    return;
  }
}
onMounted(async () => {
  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#081725");
    camera = new THREE.PerspectiveCamera(42, 1, 0.05, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    viewport.value!.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 10;
    controls.maxDistance = 700;
    scene.add(new THREE.HemisphereLight("#d3f5ff", "#294258", 1.6));
    const light = new THREE.DirectionalLight("#d2f5ff", 2);
    light.position.set(80, 180, 120);
    scene.add(light);
    headlamp = new THREE.PointLight("#def6ff", 0, 180, 1.4);
    scene.add(headlamp);
    gridHelper = new THREE.GridHelper(240, 24, "#31576c", "#163344");
    gridHelper.position.y = -48;
    scene.add(gridHelper);
    observer = new ResizeObserver(() => {
      const w = viewport.value!.clientWidth,
        h = viewport.value!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    observer.observe(viewport.value!);
    resetView();
    window.addEventListener("keydown", escape);
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (transition) {
        const t = Math.min(1, (now - transition.start) / transition.duration),
          s = t * t * (3 - 2 * t);
        camera.position.lerpVectors(transition.from, transition.to, s);
        controls.target.lerpVectors(
          transition.fromTarget,
          transition.toTarget,
          s,
        );
        camera.lookAt(controls.target);
        if (t === 1) {
          const done = transition.done;
          transition = undefined;
          done();
        }
      } else if (mode.value === "touring") {
        const t = Math.min(1, (now - tourStart) / 16000);
        tourProgress.value = Math.round(t * 100);
        camera.position.copy(toWorld([30 + 115 * t, 40.25, -531.818]));
        controls.target.copy(toWorld([45 + 115 * t, 40.25, -531.818]));
        camera.lookAt(controls.target);
        if (t === 1) pauseTour();
      } else if (mode.value === "outside") controls.update();
      headlamp.position.copy(camera.position);
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(draw);
    const [meta, grid] = await Promise.all([
      getJson<Metadata>("metadata.json"),
      getJson<VolumeGrid>("volume-grid.json"),
    ]);
    if (disposed) return;
    metadata.value = meta;
    volume.value = grid;
    await loadMesh();
  } catch (e) {
    if (!disposed) {
      error.value = String(e);
      busy.value = false;
    }
  }
});
onBeforeUnmount(() => {
  disposed = true;
  abort.abort();
  cancelAnimationFrame(frame);
  window.removeEventListener("keydown", escape);
  observer?.disconnect();
  controls?.dispose();
  scene?.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
      obj.geometry.dispose();
      (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(
        (m) => m.dispose(),
      );
    }
  });
  renderer?.dispose();
});
</script>

<style scoped>
.inversion-view {
  position: fixed;
  inset: 65px 0 0;
  z-index: 100;
  background: radial-gradient(ellipse at 50% 30%, #122d40 0%, #081521 65%);
  color: #d7e8f2;
  font:
    13px/1.5 "Microsoft YaHei",
    system-ui,
    sans-serif;
  display: flex;
  flex-direction: column;
  padding: 16px 22px 0;
  box-sizing: border-box;
  gap: 14px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: none;
  height: 58px;
}
header small {
  font-size: 10px;
  letter-spacing: 2px;
  color: #6195b3;
}
h1 {
  font-size: 24px;
  margin: 3px 0;
  font-weight: 600;
  letter-spacing: 2px;
}
h1 span {
  font-size: 14px;
  font-weight: 400;
  color: #86a8be;
  margin-left: 15px;
  letter-spacing: 1px;
}
.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  color: #86a8be;
  font-size: 12px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #52dfbd;
  box-shadow: 0 0 8px #52dfbd;
}
.dashboard {
  display: grid;
  grid-template-columns: minmax(245px, 19%) minmax(260px, 1fr) minmax(
      245px,
      19%
    );
  gap: 16px;
  min-height: 0;
  flex: 1;
}
.left-column,
.right-column {
  min-height: 0;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #26485a transparent;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.panel {
  background: linear-gradient(125deg, #102738d9, #0c1d2cc9);
  border: 1px solid #254052;
  border-top: 2px solid #356378;
  padding: 13px 15px;
  box-shadow: 0 4px 20px #0002;
  flex-shrink: 0;
}
h2 {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 12px;
  letter-spacing: 1px;
}
h2 i {
  width: 3px;
  height: 12px;
  background: #50d5d1;
}
h2 small {
  margin-left: auto;
  color: #62889d;
  font-size: 8px;
  letter-spacing: 1px;
}
.metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}
.metrics strong {
  font-size: 30px;
  font-weight: 500;
  color: #6be2dd;
  display: block;
  line-height: 1.2;
}
.metrics span {
  font-size: 10px;
  color: #7b9cad;
}
.dimensions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 9px 0;
  font-size: 10px;
  color: #9bb7c8;
}
.dimensions > div {
  height: 4px;
  flex: 1;
  background: #183445;
}
.dimensions b {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #287787, #60d9d2);
}
.dimensions em {
  font-style: normal;
  min-width: 40px;
  text-align: right;
  color: #c7e2ec;
}
.subline {
  display: flex;
  justify-content: space-between;
  color: #698d9f;
  font-size: 10px;
  margin-top: 16px;
  border-top: 1px solid #213e50;
  padding-top: 10px;
}
.caption {
  font-size: 10px;
  color: #7594a7;
  line-height: 1.7;
  margin: 6px 0 0;
}
.inline-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.inline-control label {
  font-size: 11px;
  color: #9db8c9;
}
.provenance p {
  font-size: 11px;
  color: #97afbf;
  line-height: 1.8;
}
.property-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  font-size: 10px;
}
.property-grid span {
  color: #718fa4;
}
.property-grid b {
  color: #c5dce7;
  font-weight: 400;
  margin-left: 5px;
}
nav {
  display: flex;
  gap: 15px;
  margin-top: 12px;
}
a {
  color: #53c9d0;
  font-size: 11px;
  text-decoration: none;
}
.stage {
  position: relative;
  min-width: 0;
  border-top: 1px solid #274657;
  border-bottom: 1px solid #274657;
  overflow: hidden;
  background: #081725;
}
.viewport {
  position: absolute;
  inset: 0;
  touch-action: none;
}
.stage-top,
.stage-bottom {
  position: absolute;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  color: #6b91a7;
  font-size: 10px;
  pointer-events: none;
  z-index: 1;
}
.stage-top {
  top: 16px;
}
.stage-bottom {
  bottom: 14px;
}
.stage-tag {
  color: #6bdddc;
  border-left: 2px solid #59c8c9;
  padding-left: 8px;
  letter-spacing: 1px;
}
.structure-note {
  position: absolute;
  top: 55px;
  left: 17px;
  display: flex;
  gap: 10px;
  align-items: center;
  color: #aac8d9;
  pointer-events: none;
  background: #102535c9;
  padding: 10px;
  border: 1px solid #224454;
}
.structure-note b {
  font-size: 22px;
  color: #67d1d5;
  font-weight: 400;
}
.structure-note small {
  display: block;
  font-size: 9px;
  color: #749aac;
}
.load-state {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: #091827db;
  z-index: 3;
}
.picked-note {
  position: absolute;
  bottom: 45px;
  left: 16px;
  padding: 10px 14px;
  background: #102c3ced;
  border: 1px solid #387189;
  font-size: 12px;
}
.picked-note small {
  display: block;
  font-size: 10px;
  color: #89aebf;
  margin: 5px 0;
}
.picked-note button {
  float: right;
  padding: 0 6px;
  margin-left: 12px;
}
.picked-note span {
  color: #60ded4;
}
.tour-note {
  position: absolute;
  top: 55px;
  left: 20px;
  right: 20px;
  text-align: center;
  font-size: 11px;
  pointer-events: none;
}
.tour-note {
  background: #071c2bd9;
  padding: 10px;
  border: 1px solid #31556b;
}
.tour-note small {
  font-size: 10px;
  color: #c7a976;
}
.progress {
  max-width: 240px;
  margin: 8px auto;
  height: 3px;
  background: #25485b;
}
.progress b {
  display: block;
  height: 100%;
  background: #58d9ce;
}
button,
select {
  font: inherit;
  font-size: 11px;
  color: #b9d6e5;
  border: 1px solid #305064;
  border-radius: 3px;
  background: #132c3e;
  padding: 7px 10px;
  cursor: pointer;
}
button:hover {
  border-color: #64d2d3;
  color: #ddffff;
}
button:disabled,
select:disabled {
  opacity: 0.4;
  cursor: default;
}
.primary {
  background: #166376;
  border-color: #368f9a;
  color: #d5ffff;
  min-width: 108px;
}
.control-dock {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex: none;
  background: #102535;
  border: 1px solid #2a4759;
  padding: 13px 16px;
}
.tour-controls,
.cut-controls,
.display-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cut-controls {
  flex: 1;
  border-left: 1px solid #315060;
  padding-left: 20px;
}
.check {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  font-size: 11px;
  color: #9db7c8;
}
input[type="checkbox"] {
  accent-color: #43c9c5;
}
.slider-label {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  font-size: 10px;
  color: #88a8ba;
}
.slider-label span {
  white-space: nowrap;
}
.slider-label b {
  color: #68d8d3;
  font-weight: 400;
  margin-left: 5px;
}
input[type="range"] {
  width: 100%;
  min-width: 60px;
  accent-color: #55d5d0;
  cursor: pointer;
}
.gradient {
  height: 6px;
  margin-top: 10px;
  background: linear-gradient(
    90deg,
    rgb(49, 91, 207),
    rgb(28, 190, 216),
    rgb(114, 229, 193),
    rgb(248, 204, 110),
    rgb(245, 113, 75)
  );
}
.legend {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 10px;
  color: #9dbacb;
}
footer {
  display: flex;
  justify-content: center;
  gap: 18px;
  flex: none;
  font-size: 10px;
  color: #617f93;
  padding-bottom: 8px;
}
.warning {
  color: #cead75 !important;
}
@media (min-height: 1250px) {
  .panel {
    padding: 18px;
  }
  .panel :deep(.chart) {
    height: 190px;
  }
  .left-column,
  .right-column {
    gap: 18px;
  }
  .metrics {
    margin-bottom: 22px;
  }
  .metrics strong {
    font-size: 36px;
  }
  .panel h2 {
    font-size: 15px;
  }
  .caption,
  .provenance p {
    font-size: 12px;
  }
}
@media (max-width: 1250px) {
  .inversion-view {
    padding: 10px 12px 0;
    gap: 8px;
  }
  .dashboard {
    grid-template-columns: 235px minmax(200px, 1fr) 235px;
    gap: 10px;
  }
  .panel {
    padding: 10px;
  }
  .control-dock {
    gap: 8px;
    padding: 10px 8px;
    flex-wrap: wrap;
  }
  .display-controls {
    margin-left: auto;
  }
  .cut-controls {
    padding-left: 8px;
  }
  .header-actions {
    font-size: 10px;
  }
  .structure-note {
    font-size: 10px;
  }
  h1 {
    font-size: 21px;
  }
  h1 span {
    font-size: 11px;
  }
  .slider-label {
    gap: 5px;
  }
  .panel :deep(.chart) {
    height: 135px;
  }
}
@media (max-width: 850px) {
  .dashboard {
    grid-template-columns: 205px minmax(200px, 1fr);
  }
  .right-column {
    display: none;
  }
  .header-actions {
    font-size: 0;
  }
  h1 span {
    display: none;
  }
  .cut-controls {
    border: 0;
    flex-basis: 100%;
  }
  .display-controls {
    display: none;
  }
  footer span:last-child {
    display: none;
  }
}
</style>
