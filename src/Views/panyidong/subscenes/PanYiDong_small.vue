<!-- 潘一东矿区 -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Viewer, Color, Cartesian3, SceneMode, Ion, ScreenSpaceEventHandler, defined, Cartographic, Math as CesiumMath, HeadingPitchRoll, Transforms, ScreenSpaceEventType } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import MetadataPanel from "@/Views/underground/mines/MetadataPanel.vue";

const cesiumContainer = ref(null);
const showMetadata = ref(true);
const scaleText = ref("比例尺: 1:0");
let viewer = null;

// 模型路径
const modelPath = "/models/panyidong/panyidong_1.glb";

// 元数据信息（暂无JSON文件，仅使用基础元数据）
const metadata = ref({
  dataSource: "潘一东矿区模型 (2025年采集)",
  algorithm: "3D建模",
  verticalAccuracy: "±0.15米",
  horizontalAccuracy: "±0.2米",
  resolution: "0.01米（主要区域）至0.02米（边缘区域）",
});

// 不加载JSON文件，传空字符串
const modelInfoPath = "";

// 面板标题
const panelTitle = "潘一东矿区模型信息";

// 计算比例尺
const updateScale = () => {
  if (!viewer) return;
  try {
    const camera = viewer.camera;
    const canvas = viewer.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const modelEntity = viewer.entities.values[0];
    if (!modelEntity) {
      scaleText.value = "比例尺: 1:1000";
      return;
    }
    const cameraPosition = camera.position;
    const distance = Cartesian3.magnitude(cameraPosition);
    const fov = camera.frustum.fov;
    const aspectRatio = width / height;
    const frustumWidth = 2 * distance * Math.tan(fov / 2) * aspectRatio;
    const metersPerPixel = frustumWidth / width;
    const scale = Math.round(metersPerPixel);
    scaleText.value = `比例尺: 1:${scale.toLocaleString()}`;
  } catch (error) {
    scaleText.value = "比例尺: 1:1000";
  }
};

const init = async () => {
  try {
    if (!cesiumContainer.value) return;

    Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNTUxMTJhNy0wN2I3LTRkOGMtODUwNS1mYTVlZDBjZjQxZmMiLCJpZCI6MjExODExLCJpYXQiOjE3MTkzNzI3MTN9.9PLuJMbIUtJe3WNDxxzsvNvJTVEJbaJTytOCjkwAMcU";

    viewer = new Viewer(cesiumContainer.value, {
      shouldAnimate: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      timeline: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      homeButton: false,
      shadows: false,
      baseLayer: undefined,
      terrainProvider: undefined,
      contextOptions: {
        webgl: {
          alpha: true,
        },
      },
    });

    viewer.cesiumWidget.creditContainer.style.display = "none";
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.backgroundColor = Color.fromCssColorString("#0A253D");
    viewer.scene.skyAtmosphere.show = false;
    viewer.scene.fxaa = true;
    viewer.scene.postProcessStages.fxaa.enabled = true;
    viewer.scene.sun.show = false;
    viewer.scene.moon.show = false;
    viewer.scene.skyBox.show = false;
    viewer.scene.undergroundMode = true;
    viewer.scene.globe.show = false;
    viewer.imageryLayers.get(0).alpha = 0;
    viewer.scene.globe.translucency.backFaceAlpha = 0;
    viewer.scene.globe.translucency.enabled = true;
    viewer.scene.globe.baseColor = Color.fromCssColorString("#0A253D");

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        119.08976774339175,
        33.967485840947,
        322332.94322
      ),
      orientation: {
        heading: 5.50430174,
        pitch: -0.80731316,
        roll: 0.000263373073,
      },
      duration: 1,
    });

    const position = Cartesian3.fromDegrees(112.97, 36.06, 330);
    const heading = CesiumMath.toRadians(90);
    const pitch = CesiumMath.toRadians(0);
    const roll = CesiumMath.toRadians(0);
    const hpr = new HeadingPitchRoll(heading, pitch, roll);
    const orientation = Transforms.headingPitchRollQuaternion(
      position,
      hpr
    );

    const modelEntity = viewer.entities.add({
      name: "PanYiDong Model",
      position: position,
      orientation: orientation,
      model: {
        uri: modelPath,
        scale: 5,
        minimumPixelSize: 128,
        maximumScale: 20000,
        shadows: "DISABLED",
        clampToGround: true,
      },
    });

    const point = viewer.entities.add({
      name: "Focus Point",
      position: Cartesian3.fromDegrees(
        112.976594628761,
        36.082723712917335,
        0
      ),
      point: {
        show: false,
        heightReference: "CLAMP_TO_GROUND",
      },
    });

    // 注册左键点击事件
    new ScreenSpaceEventHandler(viewer.scene.canvas).setInputAction(
      (event) => {
        const pick = viewer.scene.pick(event.position);
        const earthPosition = viewer.scene.pickPosition(event.position);

        if (defined(pick)) {
          console.log("pick: ", pick);
        }

        if (defined(earthPosition)) {
          const goePt = Cartographic.fromCartesian(earthPosition);
          const latitude = CesiumMath.toDegrees(goePt.latitude);
          const longitude = CesiumMath.toDegrees(goePt.longitude);
          const height = goePt.height;
          const pos = Cartesian3.fromDegrees(
            longitude,
            latitude,
            height
          );

          console.log("WGS84:", `${longitude},${latitude},${height}`);
          console.log("笛卡尔:", `${pos.x},${pos.y},${pos.z}`);
        }


        const camera = viewer.scene.camera;
        const cartographic = Cartographic.fromCartesian(camera.position);
        const x = CesiumMath.toDegrees(cartographic.longitude);
        const y = CesiumMath.toDegrees(cartographic.latitude);
        const z = cartographic.height;
        const pt = Cartographic.fromDegrees(x, y, z);
        const ellipsoid = viewer.scene.globe.ellipsoid;
        const cartesian3 = ellipsoid.cartographicToCartesian(pt);

        console.log("相机参数获取：");
        console.log(`heading: ${camera.heading}, pitch: ${camera.pitch}, roll: ${camera.roll}`);
        console.log("WGS84:", `${x},${y},${z}`);
        console.log("笛卡尔:", `${cartesian3.x},${cartesian3.y},${cartesian3.z}`);
      },
      ScreenSpaceEventType.LEFT_CLICK
    );

    viewer.trackedEntity = point;

    viewer.scene.requestRender();
    viewer.camera.changed.addEventListener(updateScale);
    updateScale();
    setTimeout(() => {
      updateScale();
      viewer.scene.requestRender();
    }, 1000);

  } catch (error) {
    console.error("初始化失败:", error);
  }
};

onMounted(async () => {
  await init();
});

onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy();
  }
});

const togglePanel = () => {
  showMetadata.value = !showMetadata.value;
};

// 返回主场景
const handleBack = () => {
  // 通知主场景关闭子场景
  window.dispatchEvent(new CustomEvent("mine-subscene-close"));
};

// 重置视图
const onResetView = async () => {
  if (!viewer) return;
  const entity = viewer.entities.values[0];
  if (entity) {
    try {
      await viewer.zoomTo(entity);
    } catch (_) {
      viewer.camera.setView({
        destination: Cartesian3.fromElements(0, 20, 0),
        orientation: {
          heading: 0,
          pitch: -Math.PI / 2,
          roll: 0,
        },
      });
    }
    updateScale();
    viewer.scene.requestRender();
  }
};
</script>

<template>
  <div class="viewer-container">
    <div ref="cesiumContainer" class="cesium-container"></div>
    <MetadataPanel v-model:showMetadata="showMetadata" :metadata="metadata"
      :modelInfoPath="modelInfoPath" :panelTitle="panelTitle" />
    <div class="scale-bar">
      {{ scaleText }}
    </div>
    <!-- 左侧工具栏 -->
    <div class="left-tools">
      <button class="tool-btn" @click="handleBack">返回</button>
      <button class="tool-btn" @click="togglePanel">
        {{ showMetadata ? "隐藏面板" : "显示面板" }}
      </button>
      <button class="tool-btn" @click="onResetView">重置视图</button>
    </div>
  </div>
</template>

<style scoped>
.viewer-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.cesium-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #000;
  pointer-events: auto;
}

.scale-bar {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(16, 29, 41, 0.95);
  border: 1px solid rgba(23, 199, 254, 0.3);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #17c7fe;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  pointer-events: auto;
}

.panel-toggle {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(16, 29, 41, 0.95);
  border: 1px solid rgba(23, 199, 254, 0.3);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #17c7fe;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  pointer-events: auto;
  cursor: pointer;
}

.panel-toggle:hover {
  background: rgba(23, 199, 254, 0.3);
}

/* 左侧工具栏 */
.left-tools {
  position: absolute;
  top: 50%;
  left: 240px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
}

.tool-btn {
  min-width: 100px;
  height: 34px;
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #17c7fe;
  background: #101d29;
  color: #17c7fe;
  cursor: pointer;
  pointer-events: auto;
}

.tool-btn:hover {
  background: #17c7fe;
  color: #101d29;
}
</style>