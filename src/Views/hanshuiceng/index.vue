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
          <button class="vp-tag-btn" @click="onModelTagClick">{{ modelTagLabel }}</button>
        </div>
      </div>
    </div>

    <!-- 地层操作按钮（顶部居中，横向排列） -->
    <div class="layer-controls">
      <button
        class="layer-btn"
        @click="expandLayers"
        :disabled="isExpanded || isLoading || isModelMode"
      >
        展开地层
      </button>
      <button
        class="layer-btn"
        @click="closeLayers"
        :disabled="!isExpanded || isLoading || isModelMode"
      >
        关闭地层
      </button>
      <button
        class="layer-btn"
        :class="{ active: isPerspectiveMode }"
        @click="togglePerspectiveMode"
        :disabled="isModelMode"
      >
        {{ isPerspectiveMode ? "取消透视" : "透视模式" }}
      </button>
      <button class="layer-btn" @click="toggleLayerSelector" :disabled="isModelMode">
        选择地层
      </button>
      <button class="layer-btn" @click="handleResetView" :disabled="isModelMode">
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
      <h3>地层信息</h3>
      <button class="close-btn" @click="showLayerInfo = false">×</button>
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

      <!-- 含水层模型转换效果 -->
      <div class="panel-group">
        <div class="panel-group-title">含水层模型转换效果</div>
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
            含水层模型转换效果
          </button>
          <button
            v-if="isModelMode"
            class="analysis-btn"
            :style="{ '--btn-rgb': '120, 220, 120' } as any"
            @click="exitModelMode"
          >
            返回地层视图
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
      <Footer @velocityModelShow="handleVelocityModelShow" @inversionShow="handleInversionShow" />
    </div>

    <!-- 图片弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="analysisModalVisible && analysisModalType === 'image'" class="analysis-modal" @click.self="closeAnalysisModal">
          <div class="analysis-modal-content">
            <div class="analysis-modal-header">
              <span class="analysis-modal-title">{{ analysisModalTitle }}</span>
              <button class="analysis-modal-close" @click="closeAnalysisModal">×</button>
            </div>
            <div class="analysis-modal-body">
              <img :src="analysisModalSrc" :alt="analysisModalTitle" class="analysis-modal-img" />
            </div>
          </div>
        </div>
      </Transition>
      <Transition name="fade">
        <div v-if="analysisModalVisible && analysisModalType === 'video'" class="analysis-modal" @click.self="closeAnalysisModal">
          <div class="analysis-modal-content analysis-modal-content--video">
            <div class="analysis-modal-header">
              <span class="analysis-modal-title">{{ analysisModalTitle }}</span>
              <button class="analysis-modal-close" @click="closeAnalysisModal">×</button>
            </div>
            <div class="analysis-modal-body">
              <video :src="analysisModalSrc" controls autoplay class="analysis-modal-video"></video>
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

<script setup lang='ts'>
import { ref, nextTick, onMounted, onBeforeUnmount } from "vue"
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
} from "cesium"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import Footer from "./components/Footer/index.vue"
import ImagePreviewPopup from "./components/Toolbar/ImagePreviewPopup.vue"
import WaterLevelChart from "./components/Charts/WaterLevelChart.vue"
import PorosityRadarChart from "./components/Charts/PorosityRadarChart.vue"
import StratumBarChart from "./components/Charts/StratumBarChart.vue"
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
  aquiferModelUrl,
} from "./data"
import { layerModelUrls, layerNames as geoLayerNames } from "./data/GeologicalStratification"

interface AnalysisItem {
  label: string;
  src: string;
  type: 'image' | 'video';
  color: string;
}

const analysisItems: AnalysisItem[] = [
  { label: "含水层2D分析", src: aquifer2DAnalysisImageUrl, type: "image", color: "23, 199, 254" },
  { label: "含水层3D分析", src: aquifer3DAnalysisImageUrl, type: "image", color: "0, 230, 180" },
  { label: "速度模型", src: aquiferVelocityModelImageUrl, type: "image", color: "255, 170, 50" },
  { label: "测井约束反演", src: aquiferWellConstrainedInversionImageUrl, type: "image", color: "160, 120, 255" },
  { label: "全波形反演", src: aquiferFullWaveformInversionImageUrl, type: "image", color: "255, 100, 130" },
  { label: "形成原理演示", src: aquiferFormationVideoUrl, type: "video", color: "80, 200, 120" },
];

const analysisModalVisible = ref(false);
const analysisModalTitle = ref("");
const analysisModalSrc = ref("");
const analysisModalType = ref<'image' | 'video'>("image");

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
const imagePreviewPopupRef = ref<InstanceType<typeof ImagePreviewPopup> | null>(null);
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

const isModelMode = ref(false);
const activeModelBtn = ref<'vp' | 'aquifer' | null>(null);
const modelTagVisible = ref(false);
const modelTagPos = ref({ x: 0, y: 0 });
const modelTagLabel = ref('');

let threeScene: THREE.Scene | null = null;
const threeRaycaster = new THREE.Raycaster();
const threeMouse = new THREE.Vector2();
let threeCamera: THREE.PerspectiveCamera | null = null;
let threeRenderer: THREE.WebGLRenderer | null = null;
let threeControls: OrbitControls | null = null;
let threeAnimationId: number | null = null;
let currentThreeModel: THREE.Object3D | null = null;

let allLayerEntities: Entity[] = [];
let currentSingleEntity: Entity | null = null;

const BASE_LNG = 117.22089726144343;
const BASE_LAT = 31.833569328835598;
const BASE_HEIGHT = 60;
const LAYER_GAP_DEFAULT = 10;
const LAYER_GAP_EXPANDED = 20;

function generateLayerInfo(layerId: number) {
  const layerTypes = ["砂岩", "页岩", "石灰岩", "煤层", "粉砂岩", "泥岩"];
  const randomType = layerTypes[Math.floor(Math.random() * layerTypes.length)];
  let layerName = "未知地层";
  if (layerId >= 0 && layerId < geoLayerNames.length) {
    layerName = geoLayerNames[layerId];
  }
  return {
    地层ID: layerId,
    地层名称: layerName,
    地层类型: randomType,
    "厚度(m)": (Math.random() * 50 + 10).toFixed(2),
    "深度(m)": (Math.random() * 1000 + 100).toFixed(2),
    "孔隙度(%)": (Math.random() * 15 + 5).toFixed(2),
    "渗透率(mD)": (Math.random() * 200 + 10).toFixed(2),
    "含水率(%)": (Math.random() * 20 + 5).toFixed(2),
    "密度(g/cm³)": (Math.random() * 1.5 + 2).toFixed(2),
  };
}

async function loadLayerModel(index: number, baseHeight = BASE_HEIGHT): Promise<Entity> {
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
}

function expandLayers() {
  if (!viewer || isExpanded.value) return;
  isExpanded.value = true;

  allLayerEntities.forEach((entity, index) => {
    if (entity && entity.position) {
      const expandedHeight = BASE_HEIGHT + index * LAYER_GAP_EXPANDED;
      entity.position = Cartesian3.fromDegrees(BASE_LNG, BASE_LAT, expandedHeight) as any;
    }
  });
}

function closeLayers() {
  if (!viewer || !isExpanded.value) return;
  isExpanded.value = false;

  allLayerEntities.forEach((entity, index) => {
    if (entity && entity.position) {
      const closedHeight = BASE_HEIGHT + index * LAYER_GAP_DEFAULT;
      entity.position = Cartesian3.fromDegrees(BASE_LNG, BASE_LAT, closedHeight) as any;
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
      }
    }
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
    await loadAllLayers();

    viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
      if (!viewer) return;
      const pickedFeature = viewer.scene.pick(movement.position);
      if (pickedFeature && pickedFeature.id) {
        let layerIndex = allLayerEntities.findIndex(
          (entity) => entity === pickedFeature.id
        );
        if (layerIndex === -1 && currentSingleEntity === pickedFeature.id) {
          layerIndex = selectedSingleLayer.value ?? -1;
        }
        if (layerIndex !== -1) {
          handleLayerClick(layerIndex);
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    viewer.camera.changed.addEventListener(() => {
      viewer?.scene.requestRender();
    });

  } catch (error) {
    console.error("加载失败:", error);
  }
}

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

  viewer.camera.lookAtTransform(Matrix4.IDENTITY);

  await loadAllLayers();

  viewer.scene.requestRender();
};

const handleVelocityModelShow = () => {
  imagePreviewPopupRef.value?.open(aquiferSlicePreviewGifUrl, '三维盖帽状水层速度模型');
};

const handleInversionShow = () => {
  imagePreviewPopupRef.value?.open(aquiferInversionDemoGifUrl, '反演结果动态演示');
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
  threeRenderer.setPixelRatio(window.devicePixelRatio);
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

  threeRenderer.domElement.addEventListener('click', onThreeCanvasClick);

  animateThree();
}

function onThreeCanvasClick(event: MouseEvent) {
  if (!threeRenderer || !threeCamera || !currentThreeModel || !activeModelBtn.value) return;

  const rect = threeRenderer.domElement.getBoundingClientRect();
  threeMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  threeMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  threeRaycaster.setFromCamera(threeMouse, threeCamera);
  const intersects = threeRaycaster.intersectObject(currentThreeModel, true);

  if (intersects.length > 0) {
    modelTagPos.value = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    modelTagLabel.value = activeModelBtn.value === 'vp' ? '查看vp20' : '查看vp含水层';
    modelTagVisible.value = true;
  } else {
    modelTagVisible.value = false;
  }
}

function onModelTagClick() {
  modelTagVisible.value = false;
  if (activeModelBtn.value === 'vp') {
    analysisModalTitle.value = 'VP20 三维分析';
    analysisModalSrc.value = aquifer3DAnalysisImageUrl;
  } else {
    analysisModalTitle.value = 'VP含水层动态演示';
    analysisModalSrc.value = aquiferInversionDemoGifUrl;
  }
  analysisModalType.value = 'image';
  analysisModalVisible.value = true;
}

function animateThree() {
  threeAnimationId = requestAnimationFrame(animateThree);
  if (threeControls) threeControls.update();
  if (threeRenderer && threeScene && threeCamera) {
    threeRenderer.render(threeScene, threeCamera);
  }
}

interface CameraPose {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}

function loadThreeGLB(url: string, cameraPose?: CameraPose) {
  if (!threeScene || !threeCamera) return;

  if (currentThreeModel) {
    threeScene.remove(currentThreeModel);
    currentThreeModel = null;
  }

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
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

      if (cameraPose) {
        threeCamera!.position.set(cameraPose.position.x, cameraPose.position.y, cameraPose.position.z);
        if (threeControls) {
          threeControls.target.set(cameraPose.target.x, cameraPose.target.y, cameraPose.target.z);
          threeControls.update();
        }
      } else {
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 1.8;
        threeCamera!.position.set(distance * 0.6, distance * 0.5, distance * 0.8);
        threeCamera!.lookAt(0, 0, 0);
        if (threeControls) {
          threeControls.target.set(0, 0, 0);
          threeControls.update();
        }
      }
    },
    undefined,
    (error) => {
      console.error("加载GLB模型失败:", error);
    }
  );
}

async function loadVpModel() {
  modelTagVisible.value = false;
  isModelMode.value = true;
  activeModelBtn.value = 'vp';
  await nextTick();
  initThreeScene();
  loadThreeGLB(vp20ModelUrl);
}

async function loadAquiferModel() {
  modelTagVisible.value = false;
  isModelMode.value = true;
  activeModelBtn.value = 'aquifer';
  await nextTick();
  initThreeScene();
  loadThreeGLB(aquiferModelUrl, {
    position: { x: -477.4129, y: -1646.843, z: -33.142 },
    target: { x: 27.8119, y: -20.072, z: -32.2602 },
  });
}

function exitModelMode() {
  modelTagVisible.value = false;
  isModelMode.value = false;
  activeModelBtn.value = null;
  disposeThreeScene();
}

function logCameraPose() {
  if (!threeCamera || !threeControls) return;
  const pos = threeCamera.position;
  const target = threeControls.target;
  const info = {
    position: { x: +pos.x.toFixed(4), y: +pos.y.toFixed(4), z: +pos.z.toFixed(4) },
    target: { x: +target.x.toFixed(4), y: +target.y.toFixed(4), z: +target.z.toFixed(4) },
    fov: threeCamera.fov,
    near: threeCamera.near,
    far: threeCamera.far,
  };
  console.log("📷 当前相机姿态:", JSON.stringify(info, null, 2));
  console.table(info);
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
  if (threeControls) {
    threeControls.dispose();
    threeControls = null;
  }
  if (threeRenderer) {
    threeRenderer.domElement.removeEventListener('click', onThreeCanvasClick);
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
  initCesium();
})

onBeforeUnmount(() => {
  disposeThreeScene();
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
})
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
    transition: background 0.2s, color 0.2s;

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
    box-shadow: 0 4px 24px 0 rgba(23, 199, 254, 0.18),
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
    box-shadow: 0 4px 24px 0 rgba(23, 199, 254, 0.18),
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

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    th, td {
      padding: 10px 8px;
      text-align: left;
      border-bottom: 1px solid #22384a;
      font-size: 14px;
      color: #eaf6ff;
      transition: background 0.2s, color 0.2s;
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
    top: 56px;
    bottom: 90px;
    width: 380px;
    z-index: 15;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 14px;
    padding: 14px 16px;
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

  .vp-floating-tag {
    position: absolute;
    z-index: 25;
    transform: translate(-50%, -120%);
    animation: tagFadeIn 0.18s ease-out;

    &::after {
      content: '';
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
    from { opacity: 0; transform: translate(-50%, -110%); }
    to { opacity: 1; transform: translate(-50%, -120%); }
  }

  .right-panel {
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 35px;
  }

  .panel-group {
    border: 1px solid rgba(23, 199, 254, 0.35);
    border-radius: 10px;
    background: rgba(10, 22, 40, 0.75);
    backdrop-filter: blur(10px);
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
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
    gap: 16px;
  }

  .analysis-btn {
    --btn-rgb: 23, 199, 254;
    padding: 10px 22px;
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
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(23, 199, 254, 0.1);
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
