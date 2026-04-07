<template>
  <div class="viewer-container" ref="viewerContainerRef" v-show="!showSubscene">
    <!-- cesium三维场景容器 -->
    <div class="center">
      <div class="cesium-view">
        <div ref="cesiumContainer" class="cesium-container"></div>
      </div>
    </div>

    <!-- UI 层容器，进行整体缩放 -->
    <div class="ui-layer" ref="uiLayer">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <WidgetPanel04 />
        <WidgetPanel02 />
        <WidgetPanel03 />
      </div>

      <!-- 功能按钮 -->
      <div class="toolbar-container">
        <Toolbar @flyTo="handleFlyTo" />
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <WidgetPanel01 />
        <WidgetPanel05 />
        <WidgetPanel06 />
      </div>

      <!-- 底部工具栏 -->
      <div class="bottom-panel">
        <Footer @resetView="handleResetView" @startRoaming="handleStartRoaming" />
      </div>
    </div>
  </div>
  <!-- 子场景容器 -->
  <div class="subscene-container" v-if="showSubscene">
    <router-view />
  </div>
</template>

<!-- 潘一东矿区 -->
<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue"
import { useRoute } from "vue-router";
import { Cartesian3 } from "cesium"

// 引入三维场景相关函数
import { initCesiumScene, onResetView, startRoaming, flyToPosition } from "./utils/cesiumMap.js"

// 引入组件
import Footer from "./components/Footer/index.vue"
import Toolbar from "./components/Toolbar/index.vue"
import WidgetPanel01 from "./components/Charts/WidgetPanel01.vue"
import WidgetPanel02 from "./components/Charts/WidgetPanel02.vue"
import WidgetPanel03 from "./components/Charts/WidgetPanel03.vue"
import WidgetPanel04 from "./components/Charts/WidgetPanel04.vue"
import WidgetPanel05 from "./components/Charts/WidgetPanel05.vue"
import WidgetPanel06 from "./components/Charts/WidgetPanel06.vue"
import { panyidongModelUrl } from "./data"


const cesiumContainer = ref(null);
const uiLayer = ref(null);
const viewerContainerRef = ref(null);
let viewer = null;

// 路由监听逻辑
const route = useRoute();
const showSubscene = computed(() => {
  // 如果当前路由不是主页面路由（panyidong），则说明进入了子场景
  return route.name !== 'panyidong';
});

// 场景初始化
const modelPath = panyidongModelUrl;
const init = async () => {
  if (cesiumContainer.value) {
    viewer = await initCesiumScene(cesiumContainer.value, modelPath);
  }
}

// 处理 UI 缩放 (1920x1080 基准)
const handleResize = () => {
  if (uiLayer.value && viewerContainerRef.value) {
    const width = viewerContainerRef.value.clientWidth;
    const height = viewerContainerRef.value.clientHeight;
    uiLayer.value.style.transform = `scale(${width / 1920}, ${height / 1080})`;
  }
}

// 处理重置视图
const handleResetView = () => {
  if (viewer) {
    onResetView(viewer);
  }
}

// 处理漫游
const handleStartRoaming = () => {
  if (viewer) {
    startRoaming(viewer);
  }
}

// 处理定位跳转
const handleFlyTo = (key) => {
  if (viewer) {
    flyToPosition(viewer, key);
  }
}

// 监听子场景切换，如果是切回主场景，确保重新渲染或恢复状态
watch(showSubscene, (val) => {
  if (!val) {
    // 切回主场景时，可能需要重新resize一下以确保UI正常
    setTimeout(() => {
      handleResize();
    }, 100);
  }
});

onMounted(() => {
  init();
  handleResize();
  window.addEventListener('resize', handleResize);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (viewer) {
    viewer.destroy()
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
