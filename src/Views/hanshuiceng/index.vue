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
        <!-- 含水层信息面板 -->
        <Transition name="aquifer-panel">
          <div v-if="showAquiferInfoPanel" class="aquifer-info-overlay">
            <div class="aquifer-info-card">
              <div class="aquifer-info-header">
                <span class="aquifer-info-title"
                  >含水层三维模型（实测剖面 + 模拟解释）</span
                >
                <button class="aquifer-info-close" @click="closeAquiferInfo">
                  &times;
                </button>
              </div>
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
            </div>
          </div>
        </Transition>
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

    <!-- 地层操作按钮（顶部居中，横向排列） -->
    <div class="layer-controls">
      <button
        class="layer-btn"
        :class="{ active: cesiumContentMode === 'wellNetwork' }"
        @click="switchCesiumContentMode('wellNetwork')"
        :disabled="isLoading || isModelMode"
      >
        井网示意三维
      </button>
      <button
        class="layer-btn"
        :class="{ active: cesiumContentMode === 'demoLayers' }"
        @click="switchCesiumContentMode('demoLayers')"
        :disabled="isLoading || isModelMode"
      >
        演示地层块
      </button>
      <button
        class="layer-btn"
        @click="expandLayers"
        :disabled="
          cesiumContentMode !== 'demoLayers' ||
          isExpanded ||
          isLoading ||
          isModelMode
        "
      >
        展开地层
      </button>
      <button
        class="layer-btn"
        @click="closeLayers"
        :disabled="
          cesiumContentMode !== 'demoLayers' ||
          !isExpanded ||
          isLoading ||
          isModelMode
        "
      >
        关闭地层
      </button>
      <button
        class="layer-btn"
        :class="{ active: isPerspectiveMode }"
        @click="togglePerspectiveMode"
        :disabled="cesiumContentMode !== 'demoLayers' || isModelMode"
      >
        {{ isPerspectiveMode ? "取消透视" : "透视模式" }}
      </button>
      <button
        class="layer-btn"
        @click="toggleLayerSelector"
        :disabled="cesiumContentMode !== 'demoLayers' || isModelMode"
      >
        选择地层
      </button>
      <button
        class="layer-btn"
        @click="handleResetView"
        :disabled="isLoading || isModelMode"
      >
        重置视图
      </button>
    </div>

    <!-- 地层选择器面板 -->
    <div v-if="showLayerSelector" class="layer-selector-panel">
      <h3>选择要显示的地层</h3>
      <button class="close-btn" @click="showLayerSelector = false">×</button>
      <div class="layer-list">
        <button
          v-for="(name, index) in geoLayerNames"
          :key="index"
          @click="showOnlyLayer(index)"
          :disabled="isLoading"
          :class="{ active: selectedSingleLayer === index }"
          class="layer-select-btn"
        >
          {{ name }} ({{ index }})
        </button>
      </div>
    </div>

    <!-- 地层信息面板 -->
    <div v-if="showLayerInfo" class="layer-info-panel">
      <h3>地层信息（演示）</h3>
      <button class="close-btn" @click="showLayerInfo = false">×</button>
      <p class="layer-info-note">以下数值为界面占位，非实测水文地质参数。</p>
      <table>
        <tbody>
          <tr>
            <th>属性</th>
            <th>数值</th>
          </tr>
          <tr v-for="(value, key) in selectedLayerInfo" :key="key">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </table>
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
      v-if="cesiumContentMode === 'wellNetwork' && !isModelMode"
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

    <!-- 右侧控制面板 -->
    <div class="right-panel">
      <!-- 含水层分析 -->
      <div class="panel-group">
        <div class="panel-group-title">含水层分析</div>
        <div class="panel-group-body">
          <button
            v-for="item in analysisItems"
            :key="item.label"
            class="analysis-btn"
            :style="{ '--btn-rgb': item.color } as any"
            @click="openAnalysis(item)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <!-- 含水层三维模型 -->
      <div class="panel-group">
        <div class="panel-group-title">含水层三维模型</div>
        <div class="panel-group-body">
          <button
            class="analysis-btn"
            :class="{ active: activeModelBtn === 'vp' }"
            :style="{ '--btn-rgb': '0, 180, 255' } as any"
            @click="loadVpModel"
          >
            VP模型转换效果
          </button>
          <button
            class="analysis-btn"
            :class="{ active: activeModelBtn === 'aquifer' }"
            :style="{ '--btn-rgb': '255, 160, 60' } as any"
            @click="loadAquiferModel"
          >
            吉大剖面含水层模型
          </button>
          <button
            class="analysis-btn"
            :class="{ active: showSeismicSections }"
            :style="{ '--btn-rgb': '235, 235, 245' } as any"
            :disabled="activeModelBtn !== 'aquifer'"
            @click="toggleAquiferModelPart('sections')"
          >
            {{ showSeismicSections ? "隐藏地震剖面" : "显示地震剖面" }}
          </button>
          <button
            class="analysis-btn"
            :class="{ active: showTrackedHorizons }"
            :style="{ '--btn-rgb': '255, 190, 30' } as any"
            :disabled="activeModelBtn !== 'aquifer'"
            @click="toggleAquiferModelPart('horizons')"
          >
            {{ showTrackedHorizons ? "隐藏追踪层位" : "显示追踪层位" }}
          </button>
          <button
            class="analysis-btn"
            :class="{ active: showSimulatedAquifer }"
            :style="{ '--btn-rgb': '40, 225, 205' } as any"
            :disabled="activeModelBtn !== 'aquifer'"
            @click="toggleAquiferModelPart('body')"
          >
            {{ showSimulatedAquifer ? "隐藏模拟含水层" : "显示模拟含水层" }}
          </button>
          <button
            class="analysis-btn"
            :style="{ '--btn-rgb': '0, 220, 200' } as any"
            :disabled="activeModelBtn !== 'aquifer'"
            @click="viewAquiferInfo"
          >
            查看含水层信息
          </button>
          <button
            class="analysis-btn"
            :style="{ '--btn-rgb': '180, 140, 255' } as any"
            :disabled="activeModelBtn !== 'aquifer'"
            @click="resetAquiferCamera"
          >
            重置视角
          </button>
          <button
            v-if="isModelMode"
            class="analysis-btn"
            :style="{ '--btn-rgb': '120, 220, 120' } as any"
            @click="exitModelMode"
          >
            返回井网视图
          </button>
        </div>
      </div>

      <!-- 调试工具 -->
      <button
        class="analysis-btn camera-debug-btn"
        :style="{ '--btn-rgb': '200, 200, 200' } as any"
        :disabled="!isModelMode"
        @click="logCameraPose"
      >
        输出相机姿态
      </button>
    </div>

    <!-- 底部工具栏 -->
    <div class="bottom-bar">
      <Footer
        @velocityModelShow="handleVelocityModelShow"
        @inversionShow="handleInversionShow"
      />
    </div>

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

      <ImagePreviewPopup ref="imagePreviewPopupRef" />
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
  Cartesian3,
  Color,
  SceneMode,
  ScreenSpaceEventType,
  Matrix4,
  HeadingPitchRoll,
  Transforms,
  Math as CesiumMath,
  Entity,
} from "cesium";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import Footer from "./components/Footer/index.vue";
import ImagePreviewPopup from "./components/Toolbar/ImagePreviewPopup.vue";
import WaterLevelChart from "./components/Charts/WaterLevelChart.vue";
import PorosityRadarChart from "./components/Charts/PorosityRadarChart.vue";
import StratumBarChart from "./components/Charts/StratumBarChart.vue";
import {
  aquiferInversionDemoGifUrl,
  aquiferSlicePreviewGifUrl,
  aquifer2DAnalysisImageUrl,
  aquifer3DAnalysisImageUrl,
  aquiferVelocityModelImageUrl,
  aquiferWellConstrainedInversionImageUrl,
  aquiferFullWaveformInversionImageUrl,
  aquiferFormationVideoUrl,
  vp20ModelUrl,
  aquiferLayerGlbUrl,
} from "./data";
import {
  layerModelUrls,
  layerNames as geoLayerNames,
} from "./data/GeologicalStratification";
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
const imagePreviewPopupRef = ref<InstanceType<typeof ImagePreviewPopup> | null>(
  null,
);
let viewer: Viewer | null = null;
const showSubscene = ref(false);

const isLoading = ref(false);
const isExpanded = ref(false);
const isPerspectiveMode = ref(false);
const perspectiveLayerId = ref(0);
const showLayerSelector = ref(false);
const selectedSingleLayer = ref<number | null>(null);
const showLayerInfo = ref(false);
const selectedLayerInfo = ref<Record<string, string | number>>({});
const selectedLayerId = ref<number | null>(null);

/** 吉大地震剖面含水层模型作为本页默认主场景。 */
const isModelMode = ref(true);
/** Cesium 默认展示井网示意三维；演示地层块仍可切换查看。 */
const cesiumContentMode = ref<"wellNetwork" | "demoLayers">("wellNetwork");
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
const activeModelBtn = ref<"vp" | "aquifer" | null>("aquifer");
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

let allLayerEntities: Entity[] = [];
let currentSingleEntity: Entity | null = null;
let wellSceneEntities: AquiferWellSceneEntities | null = null;
let lastWellHighlightState: {
  hoveredWellId: string | null;
  selectedWellId: string | null;
} | null = null;
let hoverClearTimer: ReturnType<typeof setTimeout> | null = null;
const HOVER_CLEAR_DELAY_MS = 90;

const BASE_LNG = 117.22089726144343;
const BASE_LAT = 31.833569328835598;
const BASE_HEIGHT = 60;
const LAYER_GAP_DEFAULT = 10;
const LAYER_GAP_EXPANDED = 20;

function generateLayerInfo(layerId: number) {
  // 演示占位：地下场景当前没有逐层实测属性，避免用随机数冒充真实资料。
  const layerName =
    layerId >= 0 && layerId < geoLayerNames.length
      ? geoLayerNames[layerId]
      : "未知地层";
  return {
    地层ID: layerId,
    地层名称: layerName,
    数据说明: "演示占位，非实测属性",
    厚度: "暂无实测",
    孔隙度: "暂无实测",
    渗透率: "暂无实测",
    含水率: "暂无实测",
    密度: "暂无实测",
  };
}

async function loadLayerModel(
  index: number,
  baseHeight = BASE_HEIGHT,
): Promise<Entity> {
  if (!viewer) throw new Error("Viewer not initialized");

  const url = layerModelUrls[index];
  const layerHeight = baseHeight + index * LAYER_GAP_DEFAULT;

  const position = Cartesian3.fromDegrees(BASE_LNG, BASE_LAT, layerHeight);
  const heading = CesiumMath.toRadians(0);
  const pitch = CesiumMath.toRadians(-90);
  const roll = CesiumMath.toRadians(90);
  const hpr = new HeadingPitchRoll(heading, pitch, roll);
  const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

  const entity = viewer.entities.add({
    position,
    orientation,
    model: {
      uri: url,
      minimumPixelSize: 128,
      maximumScale: 800,
    },
  });

  return entity;
}

async function loadAllLayers() {
  if (!viewer || isLoading.value) return;
  isLoading.value = true;

  try {
    clearAllEntities();

    for (let i = 0; i < geoLayerNames.length; i++) {
      try {
        const entity = await loadLayerModel(i);
        allLayerEntities.push(entity);
      } catch (e) {
        console.error(`加载地层 ${i} 失败:`, e);
      }
    }

    if (allLayerEntities.length > 0) {
      viewer.trackedEntity = allLayerEntities[0];
      await viewer.zoomTo(allLayerEntities[0]);
    }
  } catch (error) {
    console.error("加载所有地层失败:", error);
  } finally {
    isLoading.value = false;
  }
}

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

async function switchCesiumContentMode(mode: "wellNetwork" | "demoLayers") {
  if (!viewer || isLoading.value || cesiumContentMode.value === mode) return;
  cesiumContentMode.value = mode;
  showLayerInfo.value = false;
  showLayerSelector.value = false;
  isExpanded.value = false;
  isPerspectiveMode.value = false;
  selectedSingleLayer.value = null;
  closeWellArchivePopup();
  closeEnvelopeSummary();
  clearWellInteractionState();
  viewer.scene.canvas.style.cursor = "";

  if (mode === "wellNetwork") {
    await loadWellNetworkScene();
  } else {
    await loadAllLayers();
  }
  viewer.scene.requestRender();
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
  allLayerEntities.forEach((entity) => {
    if (entity && viewer!.entities.contains(entity)) {
      viewer!.entities.remove(entity);
    }
  });
  allLayerEntities = [];

  if (currentSingleEntity && viewer.entities.contains(currentSingleEntity)) {
    viewer.entities.remove(currentSingleEntity);
    currentSingleEntity = null;
  }

  clearAquiferWellSceneEntities(viewer, wellSceneEntities);
  wellSceneEntities = null;
}

function expandLayers() {
  if (!viewer || isExpanded.value) return;
  isExpanded.value = true;

  allLayerEntities.forEach((entity, index) => {
    if (entity && entity.position) {
      const expandedHeight = BASE_HEIGHT + index * LAYER_GAP_EXPANDED;
      entity.position = Cartesian3.fromDegrees(
        BASE_LNG,
        BASE_LAT,
        expandedHeight,
      ) as any;
    }
  });
}

function closeLayers() {
  if (!viewer || !isExpanded.value) return;
  isExpanded.value = false;

  allLayerEntities.forEach((entity, index) => {
    if (entity && entity.position) {
      const closedHeight = BASE_HEIGHT + index * LAYER_GAP_DEFAULT;
      entity.position = Cartesian3.fromDegrees(
        BASE_LNG,
        BASE_LAT,
        closedHeight,
      ) as any;
    }
  });
}

function togglePerspectiveMode() {
  if (!viewer) return;

  if (selectedSingleLayer.value !== null) {
    if (currentSingleEntity && viewer.entities.contains(currentSingleEntity)) {
      viewer.entities.remove(currentSingleEntity);
      currentSingleEntity = null;
    }
    allLayerEntities.forEach((entity) => {
      if (entity) entity.show = true;
    });
    selectedSingleLayer.value = null;
  }

  isPerspectiveMode.value = !isPerspectiveMode.value;

  if (isPerspectiveMode.value) {
    applyPerspective(0);
  } else {
    clearPerspective();
  }
}

function applyPerspective(targetLayerId: number) {
  perspectiveLayerId.value = targetLayerId;

  allLayerEntities.forEach((entity, index) => {
    if (entity && entity.model) {
      if (index === targetLayerId) {
        entity.model.color = Color.WHITE as any;
      } else {
        entity.model.color = Color.WHITE.withAlpha(0.3) as any;
      }
    }
  });
}

function clearPerspective() {
  allLayerEntities.forEach((entity) => {
    if (entity && entity.model) {
      entity.model.color = Color.WHITE as any;
    }
  });
}

function toggleLayerSelector() {
  showLayerSelector.value = !showLayerSelector.value;
}

async function showOnlyLayer(index: number) {
  if (!viewer || isLoading.value) return;
  isLoading.value = true;

  try {
    selectedSingleLayer.value = index;

    if (isPerspectiveMode.value) {
      isPerspectiveMode.value = false;
      clearPerspective();
    }

    allLayerEntities.forEach((entity) => {
      if (entity) entity.show = false;
    });

    if (currentSingleEntity && viewer.entities.contains(currentSingleEntity)) {
      viewer.entities.remove(currentSingleEntity);
      currentSingleEntity = null;
    }

    currentSingleEntity = await loadLayerModel(index);
    viewer.trackedEntity = currentSingleEntity;
    await viewer.zoomTo(currentSingleEntity);
  } catch (e) {
    console.error(`加载地层 ${index} 失败:`, e);
  } finally {
    isLoading.value = false;
  }
}

function handleLayerClick(layerId: number) {
  if (isPerspectiveMode.value) {
    applyPerspective(layerId);
  } else {
    selectedLayerId.value = layerId;
    selectedLayerInfo.value = generateLayerInfo(layerId);
    showLayerInfo.value = true;
  }
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
    if (cesiumContentMode.value === "wellNetwork") {
      await loadWellNetworkScene();
    } else {
      await loadAllLayers();
    }

    viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
      if (!viewer) return;
      const pickedFeature = viewer.scene.pick(movement.position);

      if (cesiumContentMode.value === "wellNetwork") {
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
        return;
      }

      if (pickedFeature && pickedFeature.id) {
        let layerIndex = allLayerEntities.findIndex(
          (entity) => entity === pickedFeature.id,
        );
        if (layerIndex === -1 && currentSingleEntity === pickedFeature.id) {
          layerIndex = selectedSingleLayer.value ?? -1;
        }
        if (layerIndex !== -1) {
          handleLayerClick(layerIndex);
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
      if (!viewer) return;
      const canvas = viewer.scene.canvas;

      if (cesiumContentMode.value !== "wellNetwork") {
        canvas.style.cursor = "";
        return;
      }

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

  isExpanded.value = false;
  isPerspectiveMode.value = false;
  perspectiveLayerId.value = 0;
  selectedSingleLayer.value = null;
  selectedLayerId.value = null;
  showLayerInfo.value = false;
  showLayerSelector.value = false;
  closeWellArchivePopup();
  closeEnvelopeSummary();
  clearWellInteractionState();

  viewer.camera.lookAtTransform(Matrix4.IDENTITY);

  if (cesiumContentMode.value === "wellNetwork") {
    await loadWellNetworkScene();
  } else {
    await loadAllLayers();
  }

  viewer.scene.requestRender();
};

const handleVelocityModelShow = () => {
  imagePreviewPopupRef.value?.open(
    aquiferSlicePreviewGifUrl,
    "三维盖帽状水层速度模型",
  );
};

const handleInversionShow = () => {
  imagePreviewPopupRef.value?.open(
    aquiferInversionDemoGifUrl,
    "反演结果动态演示",
  );
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
    modelTagLabel.value =
      activeModelBtn.value === "vp" ? "查看vp20" : "查看含水层模型说明";
    modelTagVisible.value = true;
  } else {
    modelTagVisible.value = false;
  }
}

function onModelTagClick() {
  modelTagVisible.value = false;
  if (activeModelBtn.value === "vp") {
    analysisModalTitle.value = "VP20 三维分析";
    analysisModalSrc.value = aquifer3DAnalysisImageUrl;
  } else {
    showAquiferInfoPanel.value = true;
    return;
  }
  analysisModalType.value = "image";
  analysisModalVisible.value = true;
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

async function loadVpModel() {
  modelTagVisible.value = false;
  isModelMode.value = true;
  activeModelBtn.value = "vp";
  await nextTick();
  initThreeScene();
  loadThreeGLB(vp20ModelUrl);
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
  if (!viewer) {
    await initCesium();
  } else {
    viewer.resize();
  }
}

function logCameraPose() {
  if (!threeCamera || !threeControls) return;
  const pos = threeCamera.position;
  const target = threeControls.target;
  const info = {
    position: {
      x: +pos.x.toFixed(4),
      y: +pos.y.toFixed(4),
      z: +pos.z.toFixed(4),
    },
    target: {
      x: +target.x.toFixed(4),
      y: +target.y.toFixed(4),
      z: +target.z.toFixed(4),
    },
    fov: threeCamera.fov,
    near: threeCamera.near,
    far: threeCamera.far,
  };
  console.log("📷 当前相机姿态:", JSON.stringify(info, null, 2));
  console.table(info);
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
  void loadAquiferModel();
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

  .layer-controls {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    max-width: min(1100px, calc(100% - 24px));
    gap: 10px;
  }

  .layer-btn {
    min-width: 90px;
    padding: 10px 20px;
    font-size: 14px;
    border-radius: 6px;
    border: 1px solid #17c7fe;
    background: rgba(16, 29, 41, 0.85);
    color: #17c7fe;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    outline: none;
    transition:
      background 0.2s,
      color 0.2s;

    &:hover:not(:disabled) {
      background: #17c7fe;
      color: #101d29;
      border-color: #17c7fe;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.active {
      background: #17c7fe;
      color: #101d29;
      border-color: #17c7fe;
    }
  }

  .layer-selector-panel {
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(16, 29, 41, 0.92);
    border-radius: 14px;
    padding: 20px 18px 16px 18px;
    width: 280px;
    max-height: 400px;
    overflow-y: auto;
    box-shadow:
      0 4px 24px 0 rgba(23, 199, 254, 0.18),
      0 1.5px 8px 0 rgba(0, 0, 0, 0.25);
    border: 1.5px solid #17c7fe;
    z-index: 30;
    backdrop-filter: blur(2px);

    h3 {
      margin-top: 0;
      margin-bottom: 18px;
      color: #17c7fe;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 1px;
    }
  }

  .layer-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .layer-select-btn {
    padding: 10px 14px;
    background: rgba(16, 29, 41, 0.8);
    border: 1px solid #22384a;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    color: #eaf6ff;
    font-size: 14px;
    font-weight: 500;

    &:hover {
      background: rgba(23, 199, 254, 0.1);
      border-color: #17c7fe;
      color: #17c7fe;
    }

    &.active {
      background: rgba(23, 199, 254, 0.2);
      border-color: #17c7fe;
      color: #17c7fe;
      box-shadow: 0 0 12px rgba(23, 199, 254, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .layer-info-panel {
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(16, 29, 41, 0.92);
    border-radius: 14px;
    padding: 20px 18px 16px 18px;
    width: 260px;
    box-shadow:
      0 4px 24px 0 rgba(23, 199, 254, 0.18),
      0 1.5px 8px 0 rgba(0, 0, 0, 0.25);
    border: 1.5px solid #17c7fe;
    z-index: 30;
    backdrop-filter: blur(2px);

    h3 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #17c7fe;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .layer-info-note {
      margin: 0 0 14px;
      color: #d9bd75;
      font-size: 12px;
      line-height: 1.5;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    th,
    td {
      padding: 10px 8px;
      text-align: left;
      border-bottom: 1px solid #22384a;
      font-size: 14px;
      color: #eaf6ff;
      transition:
        background 0.2s,
        color 0.2s;
    }

    th {
      background: #112233;
      color: #17c7fe;
      font-weight: 700;
      border-bottom: 2px solid #17c7fe;
    }

    tr:hover td {
      background: rgba(23, 199, 254, 0.08);
      color: #17c7fe;
    }
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

  .aquifer-info-overlay {
    position: absolute;
    right: 240px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 30;
    pointer-events: auto;
  }

  .aquifer-info-card {
    width: 320px;
    background: rgba(8, 18, 36, 0.92);
    border: 1px solid rgba(0, 220, 200, 0.45);
    border-radius: 12px;
    backdrop-filter: blur(14px);
    box-shadow:
      0 4px 30px rgba(0, 220, 200, 0.15),
      0 1px 8px rgba(0, 0, 0, 0.35);
    overflow: hidden;
  }

  .aquifer-info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(0, 220, 200, 0.1);
    border-bottom: 1px solid rgba(0, 220, 200, 0.25);
  }

  .aquifer-info-title {
    font-size: 15px;
    font-weight: 600;
    color: #00dcc8;
    letter-spacing: 0.5px;
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
    padding: 10px 16px 14px;
    max-height: 380px;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
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
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
  }

  .aquifer-info-value {
    font-size: 14px;
    font-weight: 600;
    color: #e0f8f4;
    text-align: right;
    padding-left: 12px;
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

  .right-panel {
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-height: calc(100% - 100px);
    padding: 4px 7px 4px 4px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(23, 199, 254, 0.28);
      border-radius: 3px;
    }
  }

  .panel-group {
    border: 1px solid rgba(23, 199, 254, 0.35);
    border-radius: 10px;
    background: rgba(10, 22, 40, 0.75);
    backdrop-filter: blur(10px);
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .panel-group-title {
    font-size: 13px;
    font-weight: 600;
    color: #17c7fe;
    letter-spacing: 1px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(23, 199, 254, 0.2);
    text-align: center;
  }

  .panel-group-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .analysis-btn {
    --btn-rgb: 23, 199, 254;
    padding: 9px 20px;
    background: rgba(var(--btn-rgb), 0.18);
    color: rgb(var(--btn-rgb));
    border: 1px solid rgba(var(--btn-rgb), 0.5);
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    backdrop-filter: blur(8px);
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: rgba(var(--btn-rgb), 0.35);
      border-color: rgba(var(--btn-rgb), 0.8);
      box-shadow: 0 0 16px rgba(var(--btn-rgb), 0.35);
    }

    &.active {
      background: rgba(var(--btn-rgb), 0.4);
      border-color: rgb(var(--btn-rgb));
      box-shadow: 0 0 20px rgba(var(--btn-rgb), 0.45);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      box-shadow: none;
    }
  }

  .camera-debug-btn {
    align-self: stretch;
    font-size: 12px;
    padding: 8px 14px;
    border-style: dashed;
  }

  .bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    pointer-events: none;
    z-index: 20;
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
