<template>
  <div class="viewer-container" ref="viewerContainerRef" v-show="!showSubscene">
    <!-- 三维场景容器 -->
    <div class="center">
      <div class="cesium-view">
        <div ref="cesiumContainer" class="cesium-container"></div>
      </div>
    </div>

    <!-- UI 层容器，进行整体缩放 -->
    <div class="ui-layer" ref="uiLayer">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <WidgetPanel01 />
        <WidgetPanel02 />
        <WidgetPanel03 />
      </div>

      <!-- 功能按钮 -->
      <div class="toolbar-container">
        <Toolbar />
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <WidgetPanel04 />
        <WidgetPanel05 />
        <WidgetPanel06 />
      </div>

      <!-- 底部工具栏 -->
      <div class="bottom-panel">
        <Footer @resetView="handleResetView" @inversionShow="handleInversionShow" />
      </div>

      <!-- 弹窗组件 -->
      <Teleport to="body">
        <ImagePreviewPopup ref="imagePreviewPopupRef" />
      </Teleport>
    </div>
  </div>
  <!-- 子场景容器 -->
  <div class="subscene-container" v-if="showSubscene">
    <router-view />
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { Viewer, Cartesian3, Color, SceneMode, ScreenSpaceEventHandler, ScreenSpaceEventType, Matrix4 } from "cesium"

// 引入组件
import Footer from "./components/Footer/index.vue"
import Toolbar from "./components/Toolbar/index.vue"
import WidgetPanel01 from "./components/Charts/WidgetPanel01.vue"
import WidgetPanel02 from "./components/Charts/WidgetPanel02.vue"
import WidgetPanel03 from "./components/Charts/WidgetPanel03.vue"
import WidgetPanel04 from "./components/Charts/WidgetPanel04.vue"
import WidgetPanel05 from "./components/Charts/WidgetPanel05.vue"
import WidgetPanel06 from "./components/Charts/WidgetPanel06.vue"
import ImagePreviewPopup from "./components/Toolbar/ImagePreviewPopup.vue"

const uiLayer = ref<HTMLElement | null>(null);
const viewerContainerRef = ref<HTMLElement | null>(null);
const cesiumContainer = ref<HTMLElement | null>(null);
const imagePreviewPopupRef = ref<InstanceType<typeof ImagePreviewPopup> | null>(null);
let viewer: Viewer | null = null;
const modelPath = "/models/aquifer/demo/aquifer_vp.glb";
const showSubscene = ref(false);

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

  // 隐藏版权信息
  (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";

  // 基础设置
  viewer.scene.globe.show = false;
  viewer.scene.backgroundColor = Color.TRANSPARENT;

  // 移除所有影像图层
  viewer.imageryLayers.removeAll();

  try {
    // 初始渲染
    setTimeout(() => {
      viewer?.scene.requestRender();
    }, 500);

    // 👇 调试用：鼠标左键点击输出当前相机位置与姿态
    const cameraHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    cameraHandler.setInputAction(() => {
      if (!viewer) return;
      const cam = viewer.camera;
      
      // 使用 positionWC (World Coordinates) 获取绝对的全局世界坐标
      // 避免因为 transform 被挂载到某个实体上时，普通的 position 变成局部坐标
      const { x, y, z } = cam.positionWC;
      
      const toDeg = (r: number) => (r * 180) / Math.PI;
      console.log("📷 相机信息 ——");
      console.log("  position (Cartesian3):", { x, y, z });
      console.log("  heading (rad / deg):", cam.heading, toDeg(cam.heading));
      console.log("  pitch   (rad / deg):", cam.pitch, toDeg(cam.pitch));
      console.log("  roll    (rad / deg):", cam.roll, toDeg(cam.roll));
      console.log("  👉 setView 参考:");
      console.log(`  destination: Cartesian3.fromElements(${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)}),`);
      console.log(`  orientation: { heading: ${cam.heading.toFixed(6)}, pitch: ${cam.pitch.toFixed(6)}, roll: ${cam.roll.toFixed(6)} }`);
    }, ScreenSpaceEventType.LEFT_CLICK);

    // 首次加载模型和视图
    loadModelAndResetView();

    // 监听相机变化以触发渲染
    viewer.camera.changed.addEventListener(() => {
      viewer?.scene.requestRender();
    });

  } catch (error) {
    console.error("加载失败:", error);
  }
}

// 提取：加载模型并重置相机视图到设定坐标
const loadModelAndResetView = () => {
  if (!viewer) return;
  
  // 加载模型
  viewer.entities.add({
    name: "vp20 Model",
    position: Cartesian3.fromElements(0, 0, 0),
    model: {
      uri: modelPath,
      scale: 1.0,
      minimumPixelSize: 64,
      maximumScale: 20000,
      color: Color.WHITE,
    },
  });

  // 直接设定相机到指定视角
  viewer.camera.setView({
    destination: Cartesian3.fromElements(-1194.2068, 866.4602, 2441.4255),
    orientation: {
      heading: 2.876939,
      pitch: -1.465306,
      roll: 1.216155
    }
  });
};

// 处理重置视图
const handleResetView = async () => {
  if (!viewer) return;

  // 1. 查找并移除现有的模型实体
  const modelEntity = viewer.entities.values.find(e => e.name === "vp20 Model");
  if (modelEntity) {
    viewer.entities.remove(modelEntity);
  }

  // 重置相机的参考坐标系到世界坐标（防止由于旋转等操作残留的 transform 导致坐标偏移）
  viewer.camera.lookAtTransform(Matrix4.IDENTITY);

  // 2. 重新调用加载
  loadModelAndResetView();
  
  // 触发渲染
  viewer.scene.requestRender();
};

// 处理反演结果展示
const handleInversionShow = () => {
  imagePreviewPopupRef.value?.open('/images/aquifer/demo/vp动图.gif', '反演结果动态演示');
};

// 处理 UI 缩放 (1920x1080 基准)
const handleResize = () => {
  if (uiLayer.value && viewerContainerRef.value) {
    const width = viewerContainerRef.value.clientWidth;
    const height = viewerContainerRef.value.clientHeight;
    uiLayer.value.style.transform = `scale(${width / 1920}, ${height / 1080})`;
  }
}

onMounted(() => {
  initCesium();
  handleResize();
  window.addEventListener('resize', handleResize);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
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

  /* Cesium 容器 - 绝对定位占满全屏，作为底层背景 */
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

  /* UI 缩放层 */
  .ui-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px;
    transform-origin: left top;
    z-index: 10;
    pointer-events: none;
    overflow: hidden;
  }

  /* 通用面板样式，确保在 Cesium 上方 */
  .left-panel,
  .right-panel,
  .bottom-panel {
    position: absolute;
    /* z-index: 10; */
    /* z-index 由 ui-layer 统一管理 */
    pointer-events: none;
    /* 让鼠标事件穿透到下方的 Cesium 场景，除非具体内容拦截 */
  }

  /* 左侧面板 */
  .left-panel {
    top: 20px;
    left: 0;
    width: 474px;
    /* 控制内部图表 */
    display: flex;
    flex-direction: column;
    grid-gap: 30px;
    /* 假设宽度，可根据需要调整 */
    height: 100%;
    padding-top: 20px;
    padding-left: 20px;
    /* 如果内容需要点击，可以在内部元素上加 pointer-events: auto */
    background: linear-gradient(to right, rgba(0, 0, 0, 0.6), transparent);
    /* 示例背景 */
    color: #fff;
  }

  /* 工具栏容器 */
  .toolbar-container {
    position: absolute;
    left: 480px;
    /* 紧邻左侧面板 */
    top: 40px;
    z-index: 20;
    pointer-events: auto;
    /* 允许点击 */
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  /* 右侧面板 */
  .right-panel {
    top: 20px;
    right: 0;
    /* bottom: 0; */
    width: 474px;
    /* 控制内部图表 */
    display: flex;
    flex-direction: column;
    grid-gap: 30px;
    /* 假设宽度，可根据需要调整 */
    height: 100%;
    padding-top: 20px;
    padding-right: 20px;
    text-align: right;
    background: linear-gradient(to left, rgba(0, 0, 0, 0.6), transparent);
    /* 示例背景 */
    color: #fff;
  }

  /* 底部工具栏 */
  .bottom-panel {
    bottom: 0;
    /* 紧贴底部 */
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    /* 水平居中 */
    pointer-events: none;
    /* 容器本身不阻挡交互 */
    z-index: 20;
    /* 确保在最上层 (如果需要点击) 或者根据需求调整 */
  }
}

.subscene-container {
  width: 100%;
  height: 100%;
}
</style>