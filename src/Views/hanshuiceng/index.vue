<template>
  <div class="viewer-container" v-show="!showSubscene">
    <!-- 三维场景容器 -->
    <div class="center">
      <div class="cesium-view" v-show="!isModelMode">
        <div ref="cesiumContainer" class="cesium-container"></div>
      </div>
      <div class="three-view" v-show="isModelMode">
        <div ref="threeContainer" class="three-container"></div>
        <!-- 模型点击浮动标签 -->
        <div
          v-if="modelTagVisible"
          class="vp-floating-tag"
          :style="{ left: modelTagPos.x + 'px', top: modelTagPos.y + 'px' }"
        >
          <button class="vp-tag-btn" @click="onModelTagClick">
            {{ modelTagLabel }}
          </button>
        </div>
        <div
          v-if="activeModelBtn === 'aquifer'"
          class="seismic-model-legend"
        >
          <div class="seismic-model-legend__title">吉大地震剖面含水层模型</div>
          <div class="seismic-model-legend__row">
            <i class="legend-swatch legend-swatch--section"></i>
            红蓝剖面：DZ1 / DZ2 / DZ5 实测振幅
          </div>
          <div class="seismic-model-legend__row">
            <i class="legend-swatch legend-swatch--horizon"></i>
            黄色线：约 720 m 蓝色波谷追踪层位
          </div>
          <div class="seismic-model-legend__row">
            <i class="legend-swatch legend-swatch--body"></i>
            青色体：36 m 厚度模拟含水层
          </div>
          <div class="seismic-model-legend__notice">
            DZ5 方位、剖面间插值与厚度为科研展示模拟；垂向夸张 2.5×
          </div>
        </div>
      </div>
    </div>

    <!-- 测网与地震解释是同一研究区的两级表达。 -->
    <div v-if="!isModelMode" class="scene-bridge scene-bridge--survey">
      <div class="scene-bridge__stage scene-bridge__stage--current">
        <span class="scene-bridge__index">01</span>
        <div>
          <small>当前 · 测试区域</small>
          <strong>含水层测网</strong>
        </div>
      </div>
      <div class="scene-bridge__flow" aria-hidden="true">
        <span></span>
        <i>→</i>
      </div>
      <button
        class="scene-bridge__primary"
        :disabled="isLoading"
        @click="loadAquiferModel"
      >
        <span class="scene-bridge__index">02</span>
        <span class="scene-bridge__primary-copy">
          <small>DZ1 · DZ2 · DZ5</small>
          <strong>地震剖面解释</strong>
        </span>
        <i aria-hidden="true">进入 ›</i>
      </button>
    </div>

    <div v-else class="model-toolbar">
      <button class="model-toolbar__back" @click="exitModelMode">
        ← 返回测网
      </button>
      <span class="model-toolbar__divider"></span>
      <button
        :class="{ active: showSeismicSections }"
        @click="toggleAquiferModelPart('sections')"
      >
        地震剖面
      </button>
      <button
        :class="{ active: showTrackedHorizons }"
        @click="toggleAquiferModelPart('horizons')"
      >
        追踪层位
      </button>
      <button
        :class="{ active: showSimulatedAquifer }"
        @click="toggleAquiferModelPart('body')"
      >
        模拟含水层
      </button>
      <button @click="viewAquiferInfo">模型说明</button>
    </div>

    <!-- 井网示意：点井档案卡 -->
    <div v-if="selectedWellCard" class="well-archive-popup">
      <div class="well-archive-header">
        <div class="well-archive-title">
          <h3>{{ selectedWellCard.name }} 井位档案</h3>
          <span
            :class="[
              'well-archive-status',
              { rich: selectedWellCard.hasResearchData },
            ]"
          >
            {{ selectedWellCard.hasResearchData ? "有研究资料" : "仅校正坐标" }}
          </span>
        </div>
        <button type="button" class="close-btn" @click="closeWellArchivePopup">
          ×
        </button>
      </div>
      <div class="well-archive-body">
        <div class="well-archive-row">
          <span class="label">WGS84</span>
          <span class="value"
            >{{ selectedWellCard.longitude }},
            {{ selectedWellCard.latitude }}</span
          >
        </div>
        <div class="well-archive-row">
          <span class="label">CGCS2000</span>
          <span class="value"
            >N {{ selectedWellCard.northing }} / E
            {{ selectedWellCard.easting }}</span
          >
        </div>
        <div class="well-archive-row">
          <span class="label">井型</span>
          <span class="value">{{ selectedWellCard.wellType }}</span>
        </div>
        <div class="well-archive-row">
          <span class="label">完井日期</span>
          <span class="value">{{ selectedWellCard.completionDate }}</span>
        </div>
        <div class="well-archive-row">
          <span class="label">所属区域</span>
          <span class="value">{{ selectedWellCard.region }}</span>
        </div>
        <div v-if="selectedWellCard.depthRange" class="well-archive-row">
          <span class="label">测深范围</span>
          <span class="value">{{ selectedWellCard.depthRange }}</span>
        </div>
        <div class="well-archive-resources">
          <div class="resource-title">已收录资料</div>
          <div
            v-if="selectedWellCard.resourceLabels.length"
            class="resource-list"
          >
            <span
              v-for="resource in selectedWellCard.resourceLabels"
              :key="resource"
              class="resource-chip"
            >
              {{ resource }}
            </span>
          </div>
          <div v-else class="resource-empty">当前仅收录校正坐标</div>
        </div>
      </div>
    </div>

    <!-- 井网示意：深度包络摘要 -->
    <div v-if="showEnvelopeSummary" class="envelope-summary-popup">
      <div class="well-archive-header">
        <div class="well-archive-title">
          <h3>深度包络摘要</h3>
          <span class="well-archive-status">浅部起测井凸包示意</span>
        </div>
        <button type="button" class="close-btn" @click="closeEnvelopeSummary">
          ×
        </button>
      </div>
      <div class="well-archive-body">
        <div class="well-archive-row">
          <span class="label">控制井数</span>
          <span class="value">{{ envelopeSummary.controlWellCount }} 口</span>
        </div>
        <div class="well-archive-row">
          <span class="label">平均顶深</span>
          <span class="value">{{ envelopeSummary.topDepth }} m</span>
        </div>
        <div class="well-archive-row">
          <span class="label">平均底深</span>
          <span class="value">{{ envelopeSummary.bottomDepth }} m</span>
        </div>
        <div class="well-archive-row">
          <span class="label">凸包顶点数</span>
          <span class="value">{{ envelopeSummary.vertexCount }}</span>
        </div>
        <div class="well-archive-row">
          <span class="label">井网规模</span>
          <span class="value">
            {{ envelopeSummary.totalWells }} 口井 /
            {{ envelopeSummary.wellsWithDepth }} 口有测深
          </span>
        </div>
        <div class="envelope-control-wells">
          <div class="resource-title">控制井</div>
          <div class="resource-list">
            <button
              v-for="wellId in envelopeSummary.controlWellIds"
              :key="wellId"
              type="button"
              class="resource-chip resource-chip-btn"
              @click="selectWellFromList(wellId)"
            >
              {{ wellId }}
            </button>
          </div>
        </div>
        <p class="envelope-note">
          半透明体为深度范围示意包络，不是含水层解释体。
        </p>
      </div>
    </div>

    <!-- 井网示意：井列表侧栏（默认折叠） -->
    <div
      v-if="!isModelMode"
      class="well-list-sidebar"
      :class="{ collapsed: !wellListExpanded }"
    >
      <div class="well-list-header">
        <h3 v-if="wellListExpanded">井列表</h3>
        <span v-if="wellListExpanded" class="well-list-count">
          {{ filteredWellList.length }} / {{ wellListItems.length }}
        </span>
        <button
          type="button"
          class="well-list-toggle"
          :title="wellListExpanded ? '折叠井列表' : '展开井列表'"
          @click="wellListExpanded = !wellListExpanded"
        >
          {{ wellListExpanded ? "收起" : "井列表" }}
        </button>
      </div>
      <template v-if="wellListExpanded">
        <div class="well-list-filters">
          <button
            v-for="filter in wellListFilters"
            :key="filter.id"
            type="button"
            class="well-filter-btn"
            :class="{ active: wellListFilter === filter.id }"
            @click="wellListFilter = filter.id"
          >
            {{ filter.label }}
          </button>
        </div>
        <div class="well-list-body">
          <button
            v-for="item in filteredWellList"
            :key="item.wellId"
            type="button"
            class="well-list-item"
            :class="{
              active: selectedWellId === item.wellId,
              hovered: hoveredWellId === item.wellId,
              logged: item.hasDepthStick,
            }"
            @click="selectWellFromList(item.wellId)"
            @mouseenter="setHoveredWell(item.wellId)"
            @mouseleave="setHoveredWell(null)"
          >
            <span class="well-list-name">{{ item.wellId }}</span>
            <span class="well-list-meta">
              {{ item.hasDepthStick ? item.depthLabel : "仅坐标" }}
            </span>
          </button>
        </div>
      </template>
    </div>

    <!-- 左侧图表面板 -->
    <div class="left-charts">
      <WaterLevelChart />
      <PorosityRadarChart />
      <StratumBarChart />
    </div>

    <!-- 右侧数据面板：操作按需展开，证据图表始终可见。 -->
    <aside class="right-data-panel">
      <Transition name="aquifer-panel" mode="out-in">
        <section
          v-if="showAquiferInfoPanel"
          key="model-info"
          class="aquifer-info-card aquifer-info-card--rail"
        >
          <div class="aquifer-info-header">
            <span>
              <small>MODEL DOCUMENTATION</small>
              <strong class="aquifer-info-title">含水层模型说明</strong>
            </span>
            <button
              class="aquifer-info-close"
              aria-label="关闭模型说明"
              @click="closeAquiferInfo"
            >
              &times;
            </button>
          </div>
          <p class="aquifer-info-summary">吉大实测地震剖面与科研展示模拟解释</p>
          <div class="aquifer-info-body">
            <div
              v-for="item in aquiferInfoData"
              :key="item.label"
              class="aquifer-info-row"
            >
              <span class="aquifer-info-label">{{ item.label }}</span>
              <span class="aquifer-info-value">{{ item.value }}</span>
            </div>
          </div>
        </section>
        <div v-else key="data-charts" class="right-data-panel__content">
          <section
            class="analysis-fold"
            :class="{ open: analysisMenuExpanded }"
          >
            <button
              class="analysis-fold__trigger"
              :aria-expanded="analysisMenuExpanded"
              @click="analysisMenuExpanded = !analysisMenuExpanded"
            >
              <span>
                <small>ANALYSIS LIBRARY</small>
                含水层分析
              </span>
              <i aria-hidden="true">⌄</i>
            </button>
            <Transition name="analysis-fold">
              <div v-show="analysisMenuExpanded" class="analysis-fold__body">
                <button
                  v-for="item in analysisItems"
                  :key="item.label"
                  class="analysis-fold__item"
                  :style="{ '--btn-rgb': item.color } as any"
                  @click="openAnalysis(item)"
                >
                  <i aria-hidden="true"></i>
                  <span>{{ item.label }}</span>
                  <b aria-hidden="true">↗</b>
                </button>
              </div>
            </Transition>
          </section>
          <JidaSeismicSurveyChart />
          <JidaHorizonDepthChart />
        </div>
      </Transition>
    </aside>

    <!-- 底部只保留当前场景的相机复位。 -->
    <button
      class="scene-reset-dock"
      type="button"
      @click="isModelMode ? resetAquiferCamera() : handleResetView()"
    >
      <i aria-hidden="true">↻</i>
      <span>{{ isModelMode ? "重置模型视角" : "重置测网视角" }}</span>
    </button>

    <!-- 图片弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="analysisModalVisible && analysisModalType === 'image'"
          class="analysis-modal"
          @click.self="closeAnalysisModal"
        >
          <div class="analysis-modal-content">
            <div class="analysis-modal-header">
              <span class="analysis-modal-title">{{ analysisModalTitle }}</span>
              <button class="analysis-modal-close" @click="closeAnalysisModal">
                ×
              </button>
            </div>
            <div class="analysis-modal-body">
              <img
                :src="analysisModalSrc"
                :alt="analysisModalTitle"
                class="analysis-modal-img"
              />
            </div>
          </div>
        </div>
      </Transition>
      <Transition name="fade">
        <div
          v-if="analysisModalVisible && analysisModalType === 'video'"
          class="analysis-modal"
          @click.self="closeAnalysisModal"
        >
          <div class="analysis-modal-content analysis-modal-content--video">
            <div class="analysis-modal-header">
              <span class="analysis-modal-title">{{ analysisModalTitle }}</span>
              <button class="analysis-modal-close" @click="closeAnalysisModal">
                ×
              </button>
            </div>
            <div class="analysis-modal-body">
              <video
                :src="analysisModalSrc"
                controls
                autoplay
                class="analysis-modal-video"
              ></video>
            </div>
          </div>
        </div>
      </Transition>

    </Teleport>
  </div>
  <!-- 子场景容器 -->
  <div class="subscene-container" v-if="showSubscene">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import {
  Viewer,
  Color,
  SceneMode,
  ScreenSpaceEventType,
  Matrix4,
  Entity,
} from "cesium";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import WaterLevelChart from "./components/Charts/WaterLevelChart.vue";
import PorosityRadarChart from "./components/Charts/PorosityRadarChart.vue";
import StratumBarChart from "./components/Charts/StratumBarChart.vue";
import JidaSeismicSurveyChart from "./components/Charts/JidaSeismicSurveyChart.vue";
import JidaHorizonDepthChart from "./components/Charts/JidaHorizonDepthChart.vue";
import {
  aquiferInversionDemoGifUrl,
  aquiferSlicePreviewGifUrl,
  aquifer2DAnalysisImageUrl,
  aquifer3DAnalysisImageUrl,
  aquiferVelocityModelImageUrl,
  aquiferWellConstrainedInversionImageUrl,
  aquiferFullWaveformInversionImageUrl,
  aquiferFormationVideoUrl,
  aquiferLayerGlbUrl,
  jidaSeismicSectionsAnalysisImageUrl,
} from "./data";
import {
  AQUIFER_WELL_SCENE_GEOMETRY,
  AQUIFER_WELL_SCENE_SUMMARY,
} from "@/data/aquifer/scene3d";
import { findAquiferWellById } from "@/data/aquifer/wells";
import { createAquiferWellPresentation } from "@/Views/surface/utils/aquiferWellPresentation";
import {
  applyAquiferWellHighlight,
  clearAquiferWellSceneEntities,
  flyToAquiferWell,
  flyToAquiferWellScene,
  loadAquiferWellSceneEntities,
  resolveAquiferWellSceneHover,
  type AquiferWellSceneEntities,
} from "./utils/aquiferWellScene";

type WellListFilter = "all" | "logged" | "coordsOnly";

interface CameraPose {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}

interface AnalysisItem {
  label: string;
  src: string;
  type: "image" | "video";
  color: string;
}

const analysisItems: AnalysisItem[] = [
  {
    label: "吉大三测线剖面分析",
    src: jidaSeismicSectionsAnalysisImageUrl,
    type: "image",
    color: "255, 205, 64",
  },
  {
    label: "含水层2D分析",
    src: aquifer2DAnalysisImageUrl,
    type: "image",
    color: "23, 199, 254",
  },
  {
    label: "含水层3D分析",
    src: aquifer3DAnalysisImageUrl,
    type: "image",
    color: "0, 230, 180",
  },
  {
    label: "速度模型",
    src: aquiferVelocityModelImageUrl,
    type: "image",
    color: "255, 170, 50",
  },
  {
    label: "速度模型动图",
    src: aquiferSlicePreviewGifUrl,
    type: "image",
    color: "48, 201, 245",
  },
  {
    label: "测井约束反演",
    src: aquiferWellConstrainedInversionImageUrl,
    type: "image",
    color: "160, 120, 255",
  },
  {
    label: "全波形反演",
    src: aquiferFullWaveformInversionImageUrl,
    type: "image",
    color: "255, 100, 130",
  },
  {
    label: "反演结果展示",
    src: aquiferInversionDemoGifUrl,
    type: "image",
    color: "101, 246, 197",
  },
  {
    label: "形成原理演示",
    src: aquiferFormationVideoUrl,
    type: "video",
    color: "80, 200, 120",
  },
];

const analysisModalVisible = ref(false);
const analysisModalTitle = ref("");
const analysisModalSrc = ref("");
const analysisModalType = ref<"image" | "video">("image");

function openAnalysis(item: AnalysisItem) {
  analysisModalTitle.value = item.label;
  analysisModalSrc.value = item.src;
  analysisModalType.value = item.type;
  analysisModalVisible.value = true;
}

function closeAnalysisModal() {
  analysisModalVisible.value = false;
}

const cesiumContainer = ref<HTMLElement | null>(null);
const threeContainer = ref<HTMLElement | null>(null);
let viewer: Viewer | null = null;
const showSubscene = ref(false);

const isLoading = ref(false);
/** 测网代表含水层测试区域，是本页默认入口。 */
const isModelMode = ref(false);
const analysisMenuExpanded = ref(false);
const wellSceneGeometry = AQUIFER_WELL_SCENE_GEOMETRY;
const selectedWellId = ref<string | null>(null);
const hoveredWellId = ref<string | null>(null);
const envelopeHovered = ref(false);
const showEnvelopeSummary = ref(false);
const wellListExpanded = ref(false);
const wellListFilter = ref<WellListFilter>("all");
const wellListFilters: ReadonlyArray<{ id: WellListFilter; label: string }> = [
  { id: "all", label: "全部" },
  { id: "logged", label: "有测深" },
  { id: "coordsOnly", label: "仅坐标" },
];
const selectedWellCard = ref<null | {
  name: string;
  longitude: string;
  latitude: string;
  northing: string;
  easting: string;
  wellType: string;
  completionDate: string;
  region: string;
  resourceLabels: readonly string[];
  hasResearchData: boolean;
  depthRange: string | null;
}>(null);

const wellListItems = wellSceneGeometry.surfaceMarkers.map((marker) => {
  const stick = wellSceneGeometry.wellSticks.find(
    (item) => item.wellId === marker.wellId,
  );
  return {
    wellId: marker.wellId,
    hasDepthStick: marker.hasDepthStick,
    depthLabel: stick
      ? `${stick.topDepth.toFixed(0)}–${stick.bottomDepth.toFixed(0)} m`
      : "",
  };
});

const filteredWellList = computed(() => {
  if (wellListFilter.value === "logged") {
    return wellListItems.filter((item) => item.hasDepthStick);
  }
  if (wellListFilter.value === "coordsOnly") {
    return wellListItems.filter((item) => !item.hasDepthStick);
  }
  return wellListItems;
});

const envelopeSummary = {
  controlWellCount: wellSceneGeometry.depthEnvelope.controlWellIds.length,
  controlWellIds: wellSceneGeometry.depthEnvelope.controlWellIds,
  topDepth: wellSceneGeometry.depthEnvelope.topDepth.toFixed(1),
  bottomDepth: wellSceneGeometry.depthEnvelope.bottomDepth.toFixed(1),
  vertexCount: AQUIFER_WELL_SCENE_SUMMARY.envelopeVertexCount,
  totalWells: AQUIFER_WELL_SCENE_SUMMARY.totalWells,
  wellsWithDepth: AQUIFER_WELL_SCENE_SUMMARY.wellsWithDepthSticks,
};
const activeModelBtn = ref<"aquifer" | null>(null);
const showSeismicSections = ref(true);
const showTrackedHorizons = ref(true);
const showSimulatedAquifer = ref(true);
const modelTagVisible = ref(false);
const modelTagPos = ref({ x: 0, y: 0 });
const modelTagLabel = ref("");

const showAquiferInfoPanel = ref(false);

const aquiferInfoData = [
  { label: "数据来源", value: "吉大 DZ1 / DZ2 / DZ5 地震振幅剖面" },
  { label: "目标层位", value: "约 720 m 蓝色波谷同相轴" },
  { label: "实测交点", value: "DZ1 第652道 / DZ2 第743道" },
  { label: "CDP间距", value: "5 m（对方提供）" },
  { label: "深度采样", value: "按 1.0 m 推定，待确认" },
  { label: "DZ5位置", value: "平行 DZ1、偏移 3 km（模拟）" },
  { label: "含水层厚度", value: "36 ± 4 m（模拟）" },
  { label: "垂向夸张", value: "2.5×（仅用于展示）" },
  { label: "模型性质", value: "科研展示用解释/模拟模型" },
  { label: "限制说明", value: "不能替代正式地质解释成果" },
];

let threeScene: THREE.Scene | null = null;
const threeRaycaster = new THREE.Raycaster();
const threeMouse = new THREE.Vector2();
let threeCamera: THREE.PerspectiveCamera | null = null;
let threeRenderer: THREE.WebGLRenderer | null = null;
let threeControls: OrbitControls | null = null;
let threeAnimationId: number | null = null;
let currentThreeModel: THREE.Object3D | null = null;
let currentThreeModelSize: THREE.Vector3 | null = null;

let wellSceneEntities: AquiferWellSceneEntities | null = null;
let lastWellHighlightState: {
  hoveredWellId: string | null;
  selectedWellId: string | null;
} | null = null;
let hoverClearTimer: ReturnType<typeof setTimeout> | null = null;
const HOVER_CLEAR_DELAY_MS = 90;

async function loadWellNetworkScene() {
  if (!viewer || isLoading.value) return;
  isLoading.value = true;

  try {
    clearAllEntities();
    lastWellHighlightState = null;
    wellSceneEntities = loadAquiferWellSceneEntities(viewer, wellSceneGeometry);
    syncWellHighlight();
    viewer.trackedEntity = undefined as unknown as Entity;
    await flyToAquiferWellScene(viewer, wellSceneGeometry);
  } catch (error) {
    console.error("加载井网示意三维失败:", error);
  } finally {
    isLoading.value = false;
  }
}

function syncWellHighlight() {
  if (!wellSceneEntities) return;
  const nextState = {
    hoveredWellId: hoveredWellId.value,
    selectedWellId: selectedWellId.value,
  };
  applyAquiferWellHighlight(
    wellSceneEntities,
    wellSceneGeometry,
    nextState,
    lastWellHighlightState,
  );
  lastWellHighlightState = nextState;
  viewer?.scene.requestRender();
}

function setHoveredWell(wellId: string | null) {
  if (hoveredWellId.value === wellId) return;
  hoveredWellId.value = wellId;
  syncWellHighlight();
}

function clearHoverClearTimer() {
  if (hoverClearTimer !== null) {
    clearTimeout(hoverClearTimer);
    hoverClearTimer = null;
  }
}

function applySceneHover(
  wellId: string | null,
  onEnvelope: boolean,
  canvas: HTMLCanvasElement,
) {
  if (wellId || onEnvelope) {
    clearHoverClearTimer();
    setHoveredWell(wellId);
    envelopeHovered.value = onEnvelope && !wellId;
    canvas.style.cursor = "pointer";
    return;
  }

  // 半透明包络内部 pick 会短暂丢命中；延迟清空避免高频闪烁。
  if (hoverClearTimer !== null) return;
  hoverClearTimer = setTimeout(() => {
    hoverClearTimer = null;
    setHoveredWell(null);
    envelopeHovered.value = false;
    canvas.style.cursor = "";
  }, HOVER_CLEAR_DELAY_MS);
}

function clearWellInteractionState() {
  clearHoverClearTimer();
  selectedWellId.value = null;
  hoveredWellId.value = null;
  envelopeHovered.value = false;
  lastWellHighlightState = null;
  if (wellSceneEntities) {
    syncWellHighlight();
  }
}

function openWellArchivePopup(wellId: string) {
  const well = findAquiferWellById(wellId);
  if (!well) return;

  const presentation = createAquiferWellPresentation(well);
  const stick = wellSceneGeometry.wellSticks.find(
    (item) => item.wellId === wellId,
  );

  showEnvelopeSummary.value = false;
  selectedWellId.value = wellId;
  selectedWellCard.value = {
    name: presentation.name,
    longitude: presentation.longitude,
    latitude: presentation.latitude,
    northing: presentation.northing,
    easting: presentation.easting,
    wellType: presentation.wellType,
    completionDate: presentation.completionDate,
    region: presentation.region,
    resourceLabels: presentation.resourceLabels,
    hasResearchData: presentation.hasResearchData,
    depthRange: stick
      ? `${stick.topDepth.toFixed(0)} – ${stick.bottomDepth.toFixed(0)} m（测深）`
      : null,
  };
  syncWellHighlight();
}

function closeWellArchivePopup() {
  selectedWellCard.value = null;
  selectedWellId.value = null;
  syncWellHighlight();
}

function openEnvelopeSummary() {
  selectedWellCard.value = null;
  selectedWellId.value = null;
  showEnvelopeSummary.value = true;
  syncWellHighlight();
}

function closeEnvelopeSummary() {
  showEnvelopeSummary.value = false;
}

async function selectWellFromList(wellId: string) {
  if (!viewer) return;
  openWellArchivePopup(wellId);
  await flyToAquiferWell(viewer, wellId, wellSceneGeometry);
  viewer.scene.requestRender();
}

function clearAllEntities() {
  if (!viewer) return;
  clearAquiferWellSceneEntities(viewer, wellSceneEntities);
  wellSceneEntities = null;
}

const initCesium = async () => {
  if (!cesiumContainer.value) return;

  viewer = new Viewer(cesiumContainer.value, {
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    sceneMode: SceneMode.SCENE3D,
    terrainProvider: undefined,
    baseLayer: false,
    skyBox: false,
    skyAtmosphere: false,
    selectionIndicator: false,
    contextOptions: {
      webgl: {
        alpha: true,
      },
    },
  });

  (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";

  viewer.scene.globe.show = false;
  viewer.scene.backgroundColor = Color.TRANSPARENT;
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.enableLighting = false;
  viewer.scene.fog.enabled = false;
  if (viewer.scene.skyAtmosphere) {
    viewer.scene.skyAtmosphere.show = false;
  }

  viewer.imageryLayers.removeAll();

  try {
    await loadWellNetworkScene();

    viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
      if (!viewer) return;
      const pickedFeature = viewer.scene.pick(movement.position);
      const picks = viewer.scene.drillPick(movement.position, 16) as Array<{
        id?: unknown;
      }>;
      const hover = resolveAquiferWellSceneHover(
        picks.length > 0 ? picks : [pickedFeature],
      );
      if (hover.wellId) {
        openWellArchivePopup(hover.wellId);
        return;
      }
      if (hover.onEnvelope) {
        openEnvelopeSummary();
        return;
      }
      closeWellArchivePopup();
      closeEnvelopeSummary();
    }, ScreenSpaceEventType.LEFT_CLICK);

    viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
      if (!viewer) return;
      const canvas = viewer.scene.canvas;

      const picks = viewer.scene.drillPick(movement.endPosition, 16) as Array<{
        id?: unknown;
      }>;
      const hover = resolveAquiferWellSceneHover(picks);
      applySceneHover(hover.wellId, hover.onEnvelope, canvas);
    }, ScreenSpaceEventType.MOUSE_MOVE);

    viewer.camera.changed.addEventListener(() => {
      viewer?.scene.requestRender();
    });
  } catch (error) {
    console.error("加载失败:", error);
  }
};

const handleResetView = async () => {
  if (!viewer) return;

  clearAllEntities();
  closeWellArchivePopup();
  closeEnvelopeSummary();
  clearWellInteractionState();

  viewer.camera.lookAtTransform(Matrix4.IDENTITY);

  await loadWellNetworkScene();

  viewer.scene.requestRender();
};

function initThreeScene() {
  if (!threeContainer.value || threeRenderer) return;

  threeScene = new THREE.Scene();
  threeScene.background = new THREE.Color(0x0a1628);

  const width = threeContainer.value.clientWidth;
  const height = threeContainer.value.clientHeight;
  threeCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10000);
  threeCamera.position.set(0, 5, 10);

  threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  threeRenderer.outputColorSpace = THREE.SRGBColorSpace;
  threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  threeRenderer.toneMappingExposure = 1.2;
  threeContainer.value.appendChild(threeRenderer.domElement);

  threeControls = new OrbitControls(threeCamera, threeRenderer.domElement);
  threeControls.enableDamping = true;
  threeControls.dampingFactor = 0.08;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  threeScene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(5, 10, 7);
  threeScene.add(dirLight);
  const dirLight2 = new THREE.DirectionalLight(0x8ec8ff, 0.4);
  dirLight2.position.set(-5, 3, -5);
  threeScene.add(dirLight2);

  threeRenderer.domElement.addEventListener("click", onThreeCanvasClick);

  animateThree();
}

function handleThreeResize() {
  if (!threeContainer.value || !threeRenderer || !threeCamera) return;
  const width = threeContainer.value.clientWidth;
  const height = threeContainer.value.clientHeight;
  if (width <= 0 || height <= 0) return;
  threeCamera.aspect = width / height;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(width, height, false);
}

function onThreeCanvasClick(event: MouseEvent) {
  if (
    !threeRenderer ||
    !threeCamera ||
    !currentThreeModel ||
    !activeModelBtn.value
  )
    return;

  const rect = threeRenderer.domElement.getBoundingClientRect();
  threeMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  threeMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  threeRaycaster.setFromCamera(threeMouse, threeCamera);
  const intersects = threeRaycaster.intersectObject(currentThreeModel, true);

  if (intersects.length > 0) {
    modelTagPos.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    modelTagLabel.value = "查看含水层模型说明";
    modelTagVisible.value = true;
  } else {
    modelTagVisible.value = false;
  }
}

function onModelTagClick() {
  modelTagVisible.value = false;
  showAquiferInfoPanel.value = true;
}

function animateThree() {
  threeAnimationId = requestAnimationFrame(animateThree);
  if (threeControls) threeControls.update();
  if (threeRenderer && threeScene && threeCamera) {
    threeRenderer.render(threeScene, threeCamera);
  }
}

function framedCameraPose(size: THREE.Vector3): CameraPose {
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 1.45;
  return {
    position: {
      x: distance * 0.62,
      y: distance * 0.42,
      z: distance * 0.78,
    },
    target: { x: 0, y: 0, z: 0 },
  };
}

function frameCurrentThreeModel() {
  if (!threeCamera || !threeControls || !currentThreeModelSize) return;
  const pose = framedCameraPose(currentThreeModelSize);
  const maxDim = Math.max(
    currentThreeModelSize.x,
    currentThreeModelSize.y,
    currentThreeModelSize.z,
  );
  threeCamera.near = Math.max(0.1, maxDim / 10_000);
  threeCamera.far = maxDim * 100;
  threeCamera.position.set(pose.position.x, pose.position.y, pose.position.z);
  threeControls.target.set(0, 0, 0);
  threeCamera.updateProjectionMatrix();
  threeControls.update();
}

function applyAquiferModelVisibility() {
  if (!currentThreeModel || activeModelBtn.value !== "aquifer") return;
  currentThreeModel.traverse((object) => {
    if (object.name.startsWith("SEISMIC_")) {
      object.visible = showSeismicSections.value;
    } else if (object.name.startsWith("HORIZON_")) {
      object.visible = showTrackedHorizons.value;
    } else if (object.name.startsWith("AQUIFER_")) {
      object.visible = showSimulatedAquifer.value;
    }
  });
}

function toggleAquiferModelPart(part: "sections" | "horizons" | "body") {
  if (part === "sections") {
    showSeismicSections.value = !showSeismicSections.value;
  } else if (part === "horizons") {
    showTrackedHorizons.value = !showTrackedHorizons.value;
  } else {
    showSimulatedAquifer.value = !showSimulatedAquifer.value;
  }
  applyAquiferModelVisibility();
}

function loadThreeGLB(url: string, cameraPose?: CameraPose) {
  if (!threeScene || !threeCamera) return;

  if (currentThreeModel) {
    threeScene.remove(currentThreeModel);
    currentThreeModel = null;
    currentThreeModelSize = null;
  }

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
  );
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);

      threeScene!.add(model);
      currentThreeModel = model;
      currentThreeModelSize = size;
      applyAquiferModelVisibility();

      if (cameraPose) {
        threeCamera!.position.set(
          cameraPose.position.x,
          cameraPose.position.y,
          cameraPose.position.z,
        );
        if (threeControls) {
          threeControls.target.set(
            cameraPose.target.x,
            cameraPose.target.y,
            cameraPose.target.z,
          );
          threeControls.update();
        }
      } else {
        frameCurrentThreeModel();
      }
      dracoLoader.dispose();
    },
    undefined,
    (error) => {
      console.error("加载GLB模型失败:", error);
    },
  );
}

async function loadAquiferModel() {
  modelTagVisible.value = false;
  isModelMode.value = true;
  activeModelBtn.value = "aquifer";
  await nextTick();
  initThreeScene();
  loadThreeGLB(aquiferLayerGlbUrl);
}

async function exitModelMode() {
  modelTagVisible.value = false;
  showAquiferInfoPanel.value = false;
  isModelMode.value = false;
  activeModelBtn.value = null;
  disposeThreeScene();
  await nextTick();
  viewer?.resize();
}

function animateCameraTo(pose: CameraPose, duration = 800): Promise<void> {
  return new Promise((resolve) => {
    if (!threeCamera || !threeControls) {
      resolve();
      return;
    }

    const startPos = threeCamera.position.clone();
    const startTarget = threeControls.target.clone();
    const endPos = new THREE.Vector3(
      pose.position.x,
      pose.position.y,
      pose.position.z,
    );
    const endTarget = new THREE.Vector3(
      pose.target.x,
      pose.target.y,
      pose.target.z,
    );

    const startTime = performance.now();
    function step() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      threeCamera!.position.lerpVectors(startPos, endPos, ease);
      threeControls!.target.lerpVectors(startTarget, endTarget, ease);
      threeControls!.update();

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

function viewAquiferInfo() {
  if (activeModelBtn.value !== "aquifer") return;
  showAquiferInfoPanel.value = true;
}

function closeAquiferInfo() {
  showAquiferInfoPanel.value = false;
}

function resetAquiferCamera() {
  if (
    activeModelBtn.value !== "aquifer" ||
    !currentThreeModelSize ||
    !threeCamera
  )
    return;
  showAquiferInfoPanel.value = false;
  const maxDim = Math.max(
    currentThreeModelSize.x,
    currentThreeModelSize.y,
    currentThreeModelSize.z,
  );
  threeCamera.near = Math.max(0.1, maxDim / 10_000);
  threeCamera.far = maxDim * 100;
  threeCamera.updateProjectionMatrix();
  animateCameraTo(framedCameraPose(currentThreeModelSize), 900);
}

function disposeThreeScene() {
  if (threeAnimationId !== null) {
    cancelAnimationFrame(threeAnimationId);
    threeAnimationId = null;
  }
  if (currentThreeModel && threeScene) {
    threeScene.remove(currentThreeModel);
    currentThreeModel = null;
  }
  currentThreeModelSize = null;
  if (threeControls) {
    threeControls.dispose();
    threeControls = null;
  }
  if (threeRenderer) {
    threeRenderer.domElement.removeEventListener("click", onThreeCanvasClick);
    threeRenderer.dispose();
    if (threeRenderer.domElement.parentNode) {
      threeRenderer.domElement.parentNode.removeChild(threeRenderer.domElement);
    }
    threeRenderer = null;
  }
  threeScene = null;
  threeCamera = null;
}

onMounted(() => {
  window.addEventListener("resize", handleThreeResize);
  void initCesium();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleThreeResize);
  clearHoverClearTimer();
  disposeThreeScene();
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
});
</script>

<style scoped lang="scss">
.viewer-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  .center {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;

    .cesium-view {
      width: 100%;
      height: 100%;

      .cesium-container {
        width: 100%;
        height: 100%;
        background: transparent;
      }
    }
  }

  .scene-bridge,
  .model-toolbar {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 24;
    display: flex;
    align-items: center;
    border: 1px solid rgba(40, 211, 235, 0.32);
    background: rgba(5, 18, 34, 0.9);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(14px);
  }

  .scene-bridge {
    width: 350px;
    box-sizing: border-box;
    gap: 0;
    padding: 5px;
    border-radius: 10px;
    border-color: rgba(54, 215, 231, .26);
    background:
      linear-gradient(90deg, rgba(8, 31, 50, .97), rgba(5, 18, 34, .94)),
      rgba(5, 18, 34, .94);
    box-shadow: 0 14px 38px rgba(0, 0, 0, .34), inset 0 1px 0 rgba(110, 237, 244, .07);
    &::before {
      content: "";
      position: absolute;
      top: -1px;
      left: 18px;
      width: 78px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #44dce9, transparent);
      box-shadow: 0 0 8px rgba(68, 220, 233, .7);
    }
  }

  .scene-bridge__stage {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 105px;
    padding: 7px 8px;
    line-height: 1.1;
    small {
      display: block;
      margin-bottom: 4px;
      color: rgba(128, 195, 207, .55);
      font-size: 8px;
      letter-spacing: .4px;
    }
    strong { color: #e5faff; font-size: 12px; font-weight: 650; white-space: nowrap; }
  }

  .scene-bridge__index {
    color: rgba(74, 219, 233, .48);
    font: 600 9px/1 "DIN Alternate", "Arial Narrow", sans-serif;
    letter-spacing: .6px;
  }

  .scene-bridge__flow {
    width: 30px;
    height: 24px;
    position: relative;
    display: flex;
    align-items: center;
    span {
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, rgba(49, 211, 230, .08), rgba(56, 216, 233, .65));
    }
    i {
      position: absolute;
      right: -2px;
      color: #52dee8;
      font: normal 11px/1 sans-serif;
    }
  }

  .scene-bridge button,
  .model-toolbar button {
    border: 0;
    color: #dffaff;
    cursor: pointer;
    transition: .2s ease;
    &:disabled { opacity: .42; cursor: wait; }
  }

  .scene-bridge__primary {
    width: 205px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border-radius: 6px;
    text-align: left;
    background: linear-gradient(112deg, rgba(9, 101, 128, .72), rgba(15, 170, 165, .62));
    box-shadow: inset 0 0 0 1px rgba(91, 238, 235, .28), 0 5px 16px rgba(5, 131, 145, .18);
    .scene-bridge__index { color: rgba(223, 255, 255, .52); }
    .scene-bridge__primary-copy { flex: 1; min-width: 0; }
    small { display: block; margin-bottom: 3px; color: rgba(218, 251, 252, .55); font-size: 8px; letter-spacing: .8px; }
    strong { display: block; color: #efffff; font-size: 12px; font-weight: 650; white-space: nowrap; }
    > i { color: rgba(231, 255, 255, .76); font: normal 10px/1 sans-serif; white-space: nowrap; }
    &:hover:not(:disabled) {
      transform: translateX(2px);
      background: linear-gradient(112deg, rgba(10, 126, 155, .82), rgba(18, 191, 183, .72));
      box-shadow: inset 0 0 0 1px rgba(118, 255, 249, .5), 0 7px 22px rgba(20, 199, 204, .2);
    }
  }

  .model-toolbar {
    gap: 5px;
    padding: 6px;
    border-radius: 10px;
    button {
      padding: 8px 12px;
      border-radius: 6px;
      background: transparent;
      color: rgba(210, 242, 247, .68);
      font-size: 12px;
      &:hover, &.active { color: #eaffff; background: rgba(38, 200, 218, .18); }
      &.active { box-shadow: inset 0 0 0 1px rgba(48, 220, 230, .35); }
    }
  }
  .model-toolbar__back { color: #5ee5d4 !important; }
  .model-toolbar__divider { width: 1px; height: 22px; background: rgba(62, 210, 226, .2); }

  @media (max-width: 1400px) {
    .scene-bridge { left: calc(50% + 30px); }
  }

  .well-archive-popup {
    position: absolute;
    top: 70px;
    right: 290px;
    z-index: 30;
    width: 320px;
    max-width: calc(100% - 40px);
    color: #eaf6ff;
    background: rgba(8, 20, 34, 0.94);
    border: 1px solid rgba(38, 217, 255, 0.45);
    border-radius: 10px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(4px);
  }

  .envelope-summary-popup {
    position: absolute;
    top: 70px;
    right: 290px;
    z-index: 30;
    width: 340px;
    max-width: calc(100% - 40px);
    color: #eaf6ff;
    background: rgba(8, 20, 34, 0.94);
    border: 1px solid rgba(38, 217, 255, 0.45);
    border-radius: 10px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(4px);
  }

  .envelope-control-wells {
    margin-top: 10px;
  }

  .envelope-note {
    margin: 12px 0 0;
    color: #9ec4d4;
    font-size: 12px;
    line-height: 1.5;
  }

  .resource-chip-btn {
    cursor: pointer;
    border: 1px solid rgba(101, 246, 197, 0.35);
    background: rgba(101, 246, 197, 0.1);
  }

  .resource-chip-btn:hover {
    border-color: rgba(101, 246, 197, 0.7);
    background: rgba(101, 246, 197, 0.2);
  }

  .well-list-sidebar {
    position: absolute;
    left: 434px;
    top: 70px;
    bottom: 90px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    width: 220px;
    color: #eaf6ff;
    background: rgba(8, 20, 34, 0.9);
    border: 1px solid rgba(38, 217, 255, 0.35);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(4px);
    overflow: hidden;
    transition:
      width 0.18s ease,
      bottom 0.18s ease;
  }

  .well-list-sidebar.collapsed {
    width: 76px;
    bottom: auto;
  }

  .well-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 10px 8px;
    border-bottom: 1px solid rgba(38, 217, 255, 0.16);
  }

  .well-list-sidebar.collapsed .well-list-header {
    border-bottom: none;
    justify-content: center;
    padding: 8px;
  }

  .well-list-header h3 {
    margin: 0;
    color: #26d9ff;
    font-size: 15px;
  }

  .well-list-count {
    color: #9ec4d4;
    font-size: 12px;
    margin-right: auto;
  }

  .well-list-toggle {
    flex-shrink: 0;
    padding: 5px 10px;
    color: #26d9ff;
    font-size: 12px;
    line-height: 1.2;
    background: rgba(38, 217, 255, 0.1);
    border: 1px solid rgba(38, 217, 255, 0.4);
    border-radius: 6px;
    cursor: pointer;
  }

  .well-list-toggle:hover {
    background: rgba(38, 217, 255, 0.2);
  }

  .well-list-filters {
    display: flex;
    gap: 6px;
    padding: 10px 12px;
  }

  .well-filter-btn {
    flex: 1;
    padding: 5px 0;
    color: #9ec4d4;
    font-size: 12px;
    background: rgba(158, 196, 212, 0.08);
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
  }

  .well-filter-btn.active,
  .well-filter-btn:hover {
    color: #26d9ff;
    border-color: rgba(38, 217, 255, 0.45);
    background: rgba(38, 217, 255, 0.12);
  }

  .well-list-body {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px 10px;
  }

  .well-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    margin-bottom: 4px;
    padding: 8px 10px;
    color: #d7ecf7;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
  }

  .well-list-item.logged .well-list-name {
    color: #65f6c5;
  }

  .well-list-item:hover,
  .well-list-item.hovered {
    border-color: rgba(255, 229, 102, 0.45);
    background: rgba(255, 229, 102, 0.08);
  }

  .well-list-item.active {
    border-color: rgba(255, 179, 71, 0.55);
    background: rgba(255, 179, 71, 0.12);
  }

  .well-list-name {
    font-size: 13px;
    font-weight: 600;
  }

  .well-list-meta {
    color: #9ec4d4;
    font-size: 11px;
    white-space: nowrap;
  }

  .well-archive-header {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 40px 12px 16px;
    border-bottom: 1px solid rgba(38, 217, 255, 0.18);
  }

  .well-archive-title h3 {
    margin: 0;
    color: #26d9ff;
    font-size: 16px;
  }

  .well-archive-status {
    display: inline-block;
    margin-top: 6px;
    padding: 2px 8px;
    color: #9ec4d4;
    font-size: 11px;
    background: rgba(158, 196, 212, 0.12);
    border-radius: 999px;
  }

  .well-archive-status.rich {
    color: #65f6c5;
    background: rgba(101, 246, 197, 0.12);
  }

  .well-archive-body {
    padding: 12px 16px 16px;
  }

  .well-archive-row {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.45;
  }

  .well-archive-row .label {
    flex: 0 0 72px;
    color: #8bb3c4;
  }

  .well-archive-row .value {
    flex: 1;
    color: #fff;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    word-break: break-all;
  }

  .well-archive-resources {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(38, 217, 255, 0.12);
  }

  .well-archive-resources .resource-title {
    margin-bottom: 8px;
    color: #8bb3c4;
    font-size: 12px;
  }

  .well-archive-resources .resource-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .well-archive-resources .resource-chip {
    padding: 3px 8px;
    color: #dff7ff;
    font-size: 11px;
    background: rgba(38, 217, 255, 0.12);
    border: 1px solid rgba(38, 217, 255, 0.28);
    border-radius: 999px;
  }

  .well-archive-resources .resource-empty {
    color: #7794a3;
    font-size: 12px;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #17c7fe;
    transition: color 0.2s;
    font-weight: bold;

    &:hover {
      color: #fff;
    }
  }

  .left-charts {
    position: absolute;
    left: 0;
    top: 30px;
    bottom: 78px;
    width: 420px;
    z-index: 15;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    gap: 25px;
    padding: 8px 12px;
    pointer-events: auto;

    &::-webkit-scrollbar {
      width: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(23, 199, 254, 0.2);
      border-radius: 2px;
    }
  }

  .three-view {
    width: 100%;
    height: 100%;
    position: relative;

    .three-container {
      width: 100%;
      height: 100%;
    }
  }

  .seismic-model-legend {
    position: absolute;
    left: 440px;
    bottom: 86px;
    z-index: 22;
    width: min(410px, calc(100vw - 720px));
    min-width: 320px;
    padding: 12px 14px;
    color: #dff8ff;
    font-size: 12px;
    line-height: 1.45;
    background: rgba(7, 18, 34, 0.84);
    border: 1px solid rgba(52, 211, 235, 0.3);
    border-radius: 10px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(10px);
    pointer-events: none;
  }

  .seismic-model-legend__title {
    margin-bottom: 7px;
    color: #7eefff;
    font-size: 14px;
    font-weight: 700;
  }

  .seismic-model-legend__row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .legend-swatch {
    display: inline-block;
    flex: 0 0 28px;
    width: 28px;
    height: 6px;
    border-radius: 999px;
  }

  .legend-swatch--section {
    background: linear-gradient(90deg, #164eff, #fff 50%, #ef233c);
  }

  .legend-swatch--horizon {
    background: #ffba14;
    box-shadow: 0 0 8px rgba(255, 186, 20, 0.75);
  }

  .legend-swatch--body {
    background: rgba(28, 232, 206, 0.75);
    box-shadow: 0 0 8px rgba(28, 232, 206, 0.5);
  }

  .seismic-model-legend__notice {
    margin-top: 8px;
    padding-top: 7px;
    color: #ffcf77;
    border-top: 1px solid rgba(126, 239, 255, 0.16);
  }

  .aquifer-info-card {
    width: 100%;
    box-sizing: border-box;
    background: rgba(8, 18, 36, 0.92);
    border: 1px solid rgba(0, 220, 200, 0.45);
    border-radius: 12px;
    backdrop-filter: blur(14px);
    box-shadow:
      0 4px 30px rgba(0, 220, 200, 0.15),
      0 1px 8px rgba(0, 0, 0, 0.35);
    overflow: hidden;
  }

  .aquifer-info-card--rail {
    min-height: 0;
    max-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .aquifer-info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(0, 220, 200, 0.1);
    border-bottom: 1px solid rgba(0, 220, 200, 0.25);
    small {
      display: block;
      margin-bottom: 3px;
      color: rgba(74, 218, 229, .52);
      font-size: 8px;
      letter-spacing: 1.3px;
    }
  }

  .aquifer-info-title {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #00dcc8;
    letter-spacing: 0.5px;
  }

  .aquifer-info-summary {
    margin: 0;
    padding: 10px 16px;
    color: rgba(191, 226, 232, .58);
    border-bottom: 1px solid rgba(0, 220, 200, .1);
    font-size: 10px;
    line-height: 1.45;
  }

  .aquifer-info-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.45);
    font-size: 22px;
    cursor: pointer;
    line-height: 1;
    padding: 0 2px;
    transition: color 0.15s;

    &:hover {
      color: #fff;
    }
  }

  .aquifer-info-body {
    min-height: 0;
    flex: 1;
    padding: 10px 16px 14px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 220, 200, 0.25);
      border-radius: 2px;
    }
  }

  .aquifer-info-row {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    align-items: start;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    transition: background 0.15s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba(0, 220, 200, 0.06);
      border-radius: 4px;
    }
  }

  .aquifer-info-label {
    padding-top: 1px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }

  .aquifer-info-value {
    min-width: 0;
    font-size: 11px;
    font-weight: 600;
    color: #e0f8f4;
    text-align: right;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .vp-floating-tag {
    position: absolute;
    z-index: 25;
    transform: translate(-50%, -120%);
    animation: tagFadeIn 0.18s ease-out;

    &::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -6px;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid rgba(23, 199, 254, 0.85);
    }
  }

  .vp-tag-btn {
    padding: 8px 20px;
    background: rgba(10, 22, 40, 0.9);
    color: #17c7fe;
    border: 1px solid rgba(23, 199, 254, 0.7);
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 12px rgba(23, 199, 254, 0.25);
    transition: all 0.2s;

    &:hover {
      background: rgba(23, 199, 254, 0.25);
      box-shadow: 0 0 18px rgba(23, 199, 254, 0.4);
    }
  }

  @keyframes tagFadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -110%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -120%);
    }
  }

  .right-data-panel {
    position: absolute;
    right: 18px;
    top: 28px;
    bottom: 82px;
    width: 326px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 4px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(23, 199, 254, 0.28);
      border-radius: 3px;
    }
  }

  .right-data-panel__content {
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .analysis-fold {
    flex: 0 0 auto;
    overflow: hidden;
    border: 1px solid rgba(33, 202, 229, 0.24);
    border-radius: 12px;
    background: rgba(5, 17, 31, .92);
    backdrop-filter: blur(12px);
  }

  .analysis-fold__trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 14px;
    border: 0;
    background: linear-gradient(110deg, rgba(26, 174, 201, .12), transparent);
    color: #e3fbff;
    cursor: pointer;
    text-align: left;
    span { font-size: 14px; font-weight: 650; }
    small { display: block; margin-bottom: 2px; color: rgba(71, 218, 235, .52); font-size: 8px; letter-spacing: 1.4px; }
    i { color: #53dfe8; font: normal 20px/1 sans-serif; transition: transform .22s ease; }
  }
  .analysis-fold.open .analysis-fold__trigger i { transform: rotate(180deg); }

  .analysis-fold__body {
    display: grid;
    gap: 6px;
    padding: 0 9px 10px;
    border-top: 1px solid rgba(45, 205, 226, .08);
  }

  .analysis-fold__item {
    --btn-rgb: 23, 199, 254;
    display: grid;
    grid-template-columns: 7px 1fr auto;
    align-items: center;
    gap: 9px;
    padding: 9px 8px;
    border: 0;
    border-bottom: 1px solid rgba(var(--btn-rgb), .1);
    background: transparent;
    color: rgba(223, 246, 250, .72);
    cursor: pointer;
    text-align: left;
    font-size: 11px;
    transition: .18s ease;
    i { width: 5px; height: 5px; border-radius: 50%; background: rgb(var(--btn-rgb)); box-shadow: 0 0 8px rgba(var(--btn-rgb), .7); }
    b { color: rgba(var(--btn-rgb), .5); font-weight: 400; }
    &:hover { color: #fff; background: rgba(var(--btn-rgb), .1); padding-left: 11px; }
  }

  .analysis-fold-enter-active,
  .analysis-fold-leave-active { transition: opacity .2s ease, transform .2s ease; transform-origin: top; }
  .analysis-fold-enter-from,
  .analysis-fold-leave-to { opacity: 0; transform: translateY(-5px); }

  .scene-reset-dock {
    position: absolute;
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%);
    z-index: 24;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 15px 9px 10px;
    border: 1px solid rgba(59, 210, 229, .32);
    border-radius: 22px;
    background: rgba(5, 20, 36, .9);
    color: rgba(218, 248, 252, .72);
    box-shadow: 0 10px 28px rgba(0, 0, 0, .3), inset 0 1px 0 rgba(111, 231, 240, .08);
    backdrop-filter: blur(12px);
    cursor: pointer;
    font-size: 11px;
    letter-spacing: .3px;
    transition: .2s ease;
    i {
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(53, 211, 225, .12);
      color: #53dfe8;
      font: normal 16px/1 sans-serif;
    }
    &:hover {
      color: #fff;
      border-color: rgba(80, 230, 237, .6);
      background: rgba(7, 31, 50, .94);
      box-shadow: 0 12px 32px rgba(0, 0, 0, .34), 0 0 16px rgba(43, 202, 217, .12);
    }
    &:focus-visible { outline: 2px solid #55e1e8; outline-offset: 3px; }
  }
}

.analysis-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.analysis-modal-content {
  position: relative;
  max-width: 60vw;
  max-height: 70vh;
  background: rgba(8, 18, 32, 0.96);
  border: 1px solid rgba(23, 199, 254, 0.35);
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.6),
    0 0 30px rgba(23, 199, 254, 0.1);
  animation: modalZoomIn 0.25s ease-out;
  display: flex;
  flex-direction: column;

  &--video {
    width: 75vw;
    max-width: 1100px;
  }
}

.analysis-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: rgba(23, 199, 254, 0.08);
  border-bottom: 1px solid rgba(23, 199, 254, 0.2);
}

.analysis-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #e0f4ff;
  letter-spacing: 0.5px;
}

.analysis-modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
  transition: color 0.15s;

  &:hover {
    color: #fff;
  }
}

.analysis-modal-body {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.analysis-modal-img {
  max-width: 58vw;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 4px;
}

.analysis-modal-video {
  width: 100%;
  max-height: 75vh;
  border-radius: 4px;
  outline: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.aquifer-panel-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.aquifer-panel-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.aquifer-panel-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.aquifer-panel-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes modalZoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.subscene-container {
  width: 100%;
  height: 100%;
}
</style>
