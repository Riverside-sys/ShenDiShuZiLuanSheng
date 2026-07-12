<template>
  <div class="surface-container">
    <!-- 地面场景工具栏 -->
    <div class="toolbar">
      <!-- 矿区切换按钮 -->
      <div class="scene-buttons">
        <button v-for="scene in scenes" :key="scene.name" @click="flyToScene(scene)"
          :class="{ active: selectedScene === scene.id }" class="scene-btn">
          {{ scene.name }}
        </button>
      </div>

      <!-- 下拉框 -->
      <select @change="handleSelect" v-model="selectedAction" class="action-select">
        <option disabled value="">请选择操作</option>
        <option value="roam">矿区场景漫游</option>
        <option value="home">区域重置</option>
      </select>
    </div>

    <div v-if="selectedScene === 'aquifer' && wellsLayerReady" class="well-legend">
      <div class="legend-title">苏北含水层井网 · {{ AQUIFER_WELLS.length }} 口</div>
      <div class="legend-item">
        <span class="legend-dot research"></span>
        有研究资料 {{ wellsWithResearchData }} 口
      </div>
      <div class="legend-item">
        <span class="legend-dot coordinate"></span>
        仅校正坐标 {{ wellsWithCoordinatesOnly }} 口
      </div>
    </div>

    <!-- 跳转地下按钮 -->
    <div v-if="showUndergroundBtn" class="underground-btn-container">
      <button @click="goToUnderground" class="underground-btn">
        <span class="btn-icon">⬇️</span>
        进入{{ currentSceneName }}地下场景
      </button>
    </div>

    <!-- Cesium 容器 -->
    <div id="cesiumContainer" class="viewer"></div>

    <!-- 测线信息弹窗 -->
    <div v-if="selectedLineInfo" class="line-info-popup" :style="popupStyle">
      <div class="popup-header">
        <h3>测线信息</h3>
        <button class="close-btn" @click="closeLinePopup">×</button>
      </div>
      <div class="popup-content">
        <div class="info-item">
          <span class="label">测线名称:</span>
          <span class="value">{{ selectedLineInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">测线长度:</span>
          <span class="value">{{ selectedLineInfo.length.toFixed(2) }} 米</span>
        </div>
        <div class="info-item">
          <span class="label">起点坐标:</span>
          <span class="value">{{ selectedLineInfo.startPoint }}</span>
        </div>
        <div class="info-item">
          <span class="label">终点坐标:</span>
          <span class="value">{{ selectedLineInfo.endPoint }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, reactive } from "vue";
import { useRouter } from "vue-router";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { AQUIFER_WELLS } from "@/data/aquifer";
import { surfaceAquiferKmlUrl, surfaceMinesGeoJsonUrl } from "./data";
import { createAquiferWellGeoJson } from "./utils/aquiferWells";
import { createLatestRequestGuard } from "./utils/latestRequest";

// 保存 Viewer 实例
let viewer = null;
// 保存当前加载的数据源 (KML 或 GeoJSON)
let currentDataSource = null;
// 含水层井位作为独立数据源，与测线 KML 分开管理
let aquiferWellDataSource = null;
// 鼠标事件处理器
let handler = null;
const sceneLoadGuard = createLatestRequestGuard();

const router = useRouter();

// 当前选中的场景
const selectedScene = ref(null);
const showUndergroundBtn = ref(false);
const currentSceneName = ref("");
const wellsLayerReady = ref(false);
const wellsWithResearchData = AQUIFER_WELLS.filter(
  (well) => well.resources.length > 0
).length;
const wellsWithCoordinatesOnly =
  AQUIFER_WELLS.length - wellsWithResearchData;
// 测线弹窗相关
const selectedLineInfo = ref(null);
const popupStyle = reactive({
  left: '0px',
  top: '0px'
});

// 存储所有添加的实体（用于清除）
const highlightEntities = [];

// 三个场景配置 - 使用与现有项目一致的坐标
const scenes = [
  {
    id: "mines",
    name: "废弃矿井",
    lon: 116.831112,
    lat: 32.790205,
    height: 8000, // 调整高度以适配框的大小
    heading: 0, // 正北方向
    pitch: -1.57, // 接近垂直俯视 (-90度)
    roll: 0,
  },
  {
    id: "aquifer",
    name: "含水层",
    lon: 119.735747,
    lat: 33.729434,
    height: 180000,
    heading: 0, // 正北方向
    pitch: -1.57, // 接近垂直俯视 (-90度)
    roll: 0,
  },
  {
    id: "saltcave",
    name: "盐穴",
    lon: 116.974957,
    lat: 36.031102,
    height: 8000, // 调整高度以适配框的大小
    heading: 0, // 正北方向
    pitch: -1.57, // 接近垂直俯视 (-90度)
    roll: 0,
  },
];

// 飞行到指定场景
async function flyToScene(scene) {
  if (!viewer) return;

  const requestIsCurrent = sceneLoadGuard.begin();
  const canApplySceneLoad = () =>
    requestIsCurrent() &&
    viewer &&
    !viewer.isDestroyed() &&
    selectedScene.value === scene.id;

  selectedScene.value = scene.id;
  currentSceneName.value = scene.name;
  showUndergroundBtn.value = false;

  // 清除之前的高亮实体
  clearHighlightEntities();

  // 清除之前的数据源 (KML 或 GeoJSON)
  clearCurrentSceneDataSources();

  // 特殊处理废弃矿井场景：加载 GeoJSON
  if (scene.id === "mines") {
    try {
      const geoJsonPath = surfaceMinesGeoJsonUrl;
      console.log("Loading GeoJSON from:", geoJsonPath);

      // 加载 GeoJSON 数据
      const dataSource = await Cesium.GeoJsonDataSource.load(geoJsonPath, {
        clampToGround: true, // 贴地显示
        fill: Cesium.Color.ORANGE.withAlpha(0.3), // 填充颜色
        stroke: Cesium.Color.ORANGE, // 边框颜色
        strokeWidth: 3,
      });

      // 如果在加载过程中切换了场景，则放弃此次加载
      if (!canApplySceneLoad()) {
        return;
      }

      viewer.dataSources.add(dataSource);
      currentDataSource = dataSource;

      // 飞行到数据范围
      viewer.flyTo(dataSource, {
        duration: 2.0,
        offset: new Cesium.HeadingPitchRange(0, -1.57, 2000)
      }).then(() => {
        if (canApplySceneLoad()) {
          // 飞行完成后显示跳转地下按钮
          showUndergroundBtn.value = true;
        }
      });

      return;
    } catch (error) {
      console.error("加载 GeoJSON 失败，降级使用默认坐标:", error);
      // 加载失败将继续执行下方的默认飞行逻辑
    }
  }

  // 特殊处理含水层场景：加载 KML
  if (scene.id === "aquifer") {
    let loadedKmlDataSource = null;

    try {
      const kmlPath = surfaceAquiferKmlUrl;
      console.log("Loading KML from:", kmlPath);

      const kmlDataSource = await Cesium.KmlDataSource.load(kmlPath, {
        camera: viewer.scene.camera,
        canvas: viewer.scene.canvas,
        clampToGround: true
      });

      // 如果在加载过程中切换了场景，则放弃此次加载
      if (!canApplySceneLoad()) {
        return;
      }

      viewer.dataSources.add(kmlDataSource);
      currentDataSource = kmlDataSource;
      loadedKmlDataSource = kmlDataSource;

      // 遍历 KML 中的实体，添加名称标签
      const entities = kmlDataSource.entities.values;
      for (const entity of entities) {
        if (entity.name && entity.polyline) {
          // 获取折线的所有位置
          const positions = entity.polyline.positions.getValue(Cesium.JulianDate.now());
          if (positions && positions.length > 0) {
            // 取折线的中间点作为标签位置
            const midIndex = Math.floor(positions.length / 2);
            const midPoint = positions[midIndex];

            // 设置实体位置用于显示 Label
            entity.position = midPoint;

            // 配置标签样式
            entity.label = {
              text: entity.name,
              font: 'bold 24px "Microsoft YaHei", sans-serif',
              fillColor: Cesium.Color.YELLOW,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 4,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -10),
              disableDepthTestDistance: Number.POSITIVE_INFINITY, // 确保标签始终显示在最上层
              scaleByDistance: new Cesium.NearFarScalar(1000, 1.2, 50000, 0.6)
            };
          }
        }
      }

      // 绑定点击事件
      bindClickEvent();
    } catch (error) {
      console.error("加载含水层测线 KML 失败:", error);
    }

    try {
      const wellGeoJson = createAquiferWellGeoJson(AQUIFER_WELLS);
      const wellDataSource = await Cesium.GeoJsonDataSource.load(wellGeoJson, {
        clampToGround: true,
      });

      if (!canApplySceneLoad()) {
        return;
      }

      viewer.dataSources.add(wellDataSource);
      aquiferWellDataSource = wellDataSource;
      styleAquiferWellEntities(wellDataSource);
      wellsLayerReady.value = true;

      viewer.flyTo(wellDataSource, {
        duration: 2.0,
      }).then(() => {
        if (canApplySceneLoad()) {
          showUndergroundBtn.value = true;
        }
      });

      return;
    } catch (error) {
      console.error("加载含水层井位失败:", error);
    }

    if (loadedKmlDataSource) {
      viewer.flyTo(loadedKmlDataSource, {
        duration: 2.0,
      }).then(() => {
        if (canApplySceneLoad()) {
          showUndergroundBtn.value = true;
        }
      });
      return;
    }
  }

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      scene.lon,
      scene.lat,
      scene.height
    ),
    orientation: {
      heading: scene.heading,
      pitch: scene.pitch,
      roll: scene.roll,
    },
    duration: 2,
    complete: () => {
      if (!canApplySceneLoad()) return;
      // 飞行完成后显示跳转地下按钮
      showUndergroundBtn.value = true;
      // 添加高亮区域和标签
      addHighlightArea(scene);
    },
  });
}

// 清除所有高亮实体
function clearHighlightEntities() {
  if (!viewer) return;
  highlightEntities.forEach((entity) => {
    viewer.entities.remove(entity);
  });
  highlightEntities.length = 0;
}

// 移除当前场景加载的测线、区域和井位数据源
function clearCurrentSceneDataSources() {
  if (currentDataSource && viewer && !viewer.isDestroyed()) {
    viewer.dataSources.remove(currentDataSource);
  }
  currentDataSource = null;

  if (aquiferWellDataSource && viewer && !viewer.isDestroyed()) {
    viewer.dataSources.remove(aquiferWellDataSource);
  }
  aquiferWellDataSource = null;
  wellsLayerReady.value = false;
}

// 根据是否具备研究资料设置井点和标签样式
function styleAquiferWellEntities(dataSource) {
  const now = Cesium.JulianDate.now();

  for (const entity of dataSource.entities.values) {
    const properties = entity.properties?.getValue(now) ?? {};
    const hasResearchData = properties.hasResearchData === true;
    const color = hasResearchData
      ? Cesium.Color.fromCssColorString("#65f6c5")
      : Cesium.Color.fromCssColorString("#00d8ff");

    entity.billboard = undefined;
    entity.point = new Cesium.PointGraphics({
      pixelSize: hasResearchData ? 12 : 8,
      color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: hasResearchData ? 2 : 1,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(2000, 1.4, 500000, 0.65),
    });
    entity.label = new Cesium.LabelGraphics({
      text: properties.name ?? entity.name ?? "",
      font: hasResearchData
        ? 'bold 16px "Microsoft YaHei", sans-serif'
        : '14px "Microsoft YaHei", sans-serif',
      fillColor: color,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -12),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0,
        hasResearchData ? 300000 : 90000
      ),
      scaleByDistance: new Cesium.NearFarScalar(2000, 1.1, 300000, 0.55),
    });
  }
}

// 添加高亮区域和文字标签
function addHighlightArea(scene) {
  if (!viewer) return;

  // 定义矩形框的大小（缩小到约0.015度，大约1.5-2公里，适合8000米高度完整显示）
  const offset = 0.0075;
  const west = scene.lon - offset;
  const east = scene.lon + offset;
  const south = scene.lat - offset;
  const north = scene.lat + offset;

  // 添加矩形边框（发光效果）
  const rectangleEntity = viewer.entities.add({
    name: `${scene.name}_highlight`,
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
      material: Cesium.Color.CYAN.withAlpha(0.3),
      outline: true,
      outlineColor: Cesium.Color.CYAN,
      outlineWidth: 3,
      height: 0,
      extrudedHeight: 50,
    },
  });
  highlightEntities.push(rectangleEntity);

  // 添加闪烁的边框效果（使用多个矩形叠加）
  const glowRectangle = viewer.entities.add({
    name: `${scene.name}_glow`,
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(
        west - 0.001,
        south - 0.001,
        east + 0.001,
        north + 0.001
      ),
      material: new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty(() => {
          const time = Date.now() / 1000;
          const alpha = ((Math.sin(time * 2) + 1) / 2) * 0.5;
          return Cesium.Color.CYAN.withAlpha(alpha);
        }, false)
      ),
      outline: true,
      outlineColor: new Cesium.CallbackProperty(() => {
        const time = Date.now() / 1000;
        const alpha = ((Math.sin(time * 2) + 1) / 2) * 0.8;
        return Cesium.Color.CYAN.withAlpha(alpha);
      }, false),
      outlineWidth: 2,
      height: 0,
    },
  });
  highlightEntities.push(glowRectangle);

  // 添加中心点标记
  const centerPoint = viewer.entities.add({
    name: `${scene.name}_center`,
    position: Cesium.Cartesian3.fromDegrees(scene.lon, scene.lat, 100),
    point: {
      pixelSize: 15,
      color: Cesium.Color.CYAN,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });
  highlightEntities.push(centerPoint);

  // 添加文字标签
  const labelEntity = viewer.entities.add({
    name: `${scene.name}_label`,
    position: Cesium.Cartesian3.fromDegrees(scene.lon, scene.lat, 200),
    label: {
      text: `深地特殊空间——${scene.name}示范区`,
      font: 'bold 24px "Microsoft YaHei", Arial, sans-serif',
      fillColor: Cesium.Color.CYAN,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -20),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(1000, 1.5, 50000, 0.5),
    },
  });
  highlightEntities.push(labelEntity);

  // 添加副标题标签
  const subLabelEntity = viewer.entities.add({
    name: `${scene.name}_sublabel`,
    position: Cesium.Cartesian3.fromDegrees(scene.lon, scene.lat, 200),
    label: {
      text: `Digital Twin Demonstration Area`,
      font: '16px "Arial", sans-serif',
      fillColor: Cesium.Color.fromCssColorString("#00d8ff"),
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, 5),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(1000, 1.2, 50000, 0.4),
    },
  });
  highlightEntities.push(subLabelEntity);

  // 添加四个角的标记点
  const corners = [
    [west, south],
    [west, north],
    [east, north],
    [east, south],
  ];
  corners.forEach((corner, index) => {
    const cornerPoint = viewer.entities.add({
      name: `${scene.name}_corner_${index}`,
      position: Cesium.Cartesian3.fromDegrees(corner[0], corner[1], 50),
      point: {
        pixelSize: 8,
        color: Cesium.Color.CYAN.withAlpha(0.8),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
    highlightEntities.push(cornerPoint);
  });
}

const selectedAction = ref("");

// 处理下拉框选择
function handleSelect() {
  if (selectedAction.value === "roam") {
    roamScenes();
  } else if (selectedAction.value === "home") {
    flyHome();
  }
  // 重置选择框
  selectedAction.value = "";
}

// 场景漫游功能
function roamScenes() {
  if (!viewer) return;

  const roamIsCurrent = sceneLoadGuard.begin();
  const canContinueRoam = () =>
    roamIsCurrent() && viewer && !viewer.isDestroyed();
  clearCurrentSceneDataSources();
  clearHighlightEntities();
  showUndergroundBtn.value = false;
  selectedLineInfo.value = null;
  if (handler) {
    handler.destroy();
    handler = null;
  }

  const camera = viewer.camera;

  // --- 定义三个飞行阶段：
  const firstOptions = {
    destination: Cesium.Cartesian3.fromDegrees(
      scenes[0].lon,
      scenes[0].lat,
      scenes[0].height
    ),
    duration: 3,
    orientation: {
      heading: scenes[0].heading,
      pitch: scenes[0].pitch,
      roll: scenes[0].roll,
    },
  };

  const secondOptions = {
    destination: Cesium.Cartesian3.fromDegrees(
      scenes[1].lon,
      scenes[1].lat,
      scenes[1].height
    ),
    duration: 6,
    orientation: {
      heading: scenes[1].heading,
      pitch: scenes[1].pitch,
      roll: scenes[1].roll,
    },
  };

  const thirdOptions = {
    destination: Cesium.Cartesian3.fromDegrees(
      scenes[2].lon,
      scenes[2].lat,
      scenes[2].height
    ),
    duration: 6,
    orientation: {
      heading: scenes[2].heading,
      pitch: scenes[2].pitch,
      roll: scenes[2].roll,
    },
  };

  // 在区域一停留 1 秒后飞往区域二
  firstOptions.complete = () => {
    if (!canContinueRoam()) return;
    selectedScene.value = scenes[0].id;
    currentSceneName.value = scenes[0].name;
    addHighlightArea(scenes[0]);
    setTimeout(() => {
      if (!canContinueRoam()) return;
      clearHighlightEntities();
      camera.flyTo(secondOptions);
    }, 1000);
  };

  // 在区域二停留 1 秒后飞往区域三
  secondOptions.complete = () => {
    if (!canContinueRoam()) return;
    selectedScene.value = scenes[1].id;
    currentSceneName.value = scenes[1].name;
    addHighlightArea(scenes[1]);
    setTimeout(() => {
      if (!canContinueRoam()) return;
      clearHighlightEntities();
      camera.flyTo(thirdOptions);
    }, 1000);
  };

  // 在区域三完成时显示跳转按钮
  thirdOptions.complete = () => {
    if (!canContinueRoam()) return;
    selectedScene.value = scenes[2].id;
    currentSceneName.value = scenes[2].name;
    addHighlightArea(scenes[2]);
    showUndergroundBtn.value = true;
  };

  // 从区域一开始漫游
  camera.flyTo(firstOptions);
}

// 绑定鼠标点击事件
function bindClickEvent() {
  if (!viewer) return;

  // 如果已经绑定过，先销毁
  if (handler) {
    handler.destroy();
    handler = null;
  }

  handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.position);

    if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.polyline) {
      const entity = pickedObject.id;

      // 计算测线长度和坐标信息
      const positions = entity.polyline.positions.getValue(Cesium.JulianDate.now());
      let length = 0;
      let startPointStr = "";
      let endPointStr = "";

      if (positions && positions.length > 0) {
        // 计算总长度
        for (let i = 0; i < positions.length - 1; i++) {
          length += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
        }

        // 获取起点和终点坐标 (转为经纬度)
        const startCartographic = Cesium.Cartographic.fromCartesian(positions[0]);
        const endCartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);

        startPointStr = `${Cesium.Math.toDegrees(startCartographic.longitude).toFixed(6)}, ${Cesium.Math.toDegrees(startCartographic.latitude).toFixed(6)}`;
        endPointStr = `${Cesium.Math.toDegrees(endCartographic.longitude).toFixed(6)}, ${Cesium.Math.toDegrees(endCartographic.latitude).toFixed(6)}`;
      }

      // 更新选中信息
      selectedLineInfo.value = {
        name: entity.name || "未命名测线",
        length: length,
        startPoint: startPointStr,
        endPoint: endPointStr
      };

      // 设置弹窗位置
      popupStyle.left = `${movement.position.x + 15}px`;
      popupStyle.top = `${movement.position.y + 15}px`;

      // 高亮显示选中的测线（可选：改变颜色或宽度）
      // ...
    } else {
      // 点击空白处关闭弹窗
      selectedLineInfo.value = null;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

// 关闭弹窗
function closeLinePopup() {
  selectedLineInfo.value = null;
}

// 跳转到地下场景
function goToUnderground() {
  if (selectedScene.value === "mines") {
    router.push("/panyidong");
  } else if (selectedScene.value === "aquifer") {
    router.push("/hanshuiceng");
  } else if (selectedScene.value === "saltcave") {
    router.push("/saltcave");
  }
}

// 回归到初始地球视角
function flyHome() {
  if (!viewer) return;
  sceneLoadGuard.invalidate();
  viewer.camera.flyHome(2);
  selectedScene.value = null;
  showUndergroundBtn.value = false;
  clearHighlightEntities();

  clearCurrentSceneDataSources();

  // 销毁事件处理器
  if (handler) {
    handler.destroy();
    handler = null;
  }

  selectedLineInfo.value = null;
}

onMounted(async () => {
  try {
    // 设置 Cesium AccessToken
    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYWY1MDY0ZC1hOWNjLTQzY2QtODZlYy0wOGY1MGI2NTA0OTAiLCJpZCI6MzAzNDgzLCJpYXQiOjE3NDc1NjExNTJ9.qvdGNTNDD4XEnC4LFeRXsQAIhB4SdDnxlIodHcvQ69k";

    // 隐藏页面中的其他元素，确保页面独立
    const appContainer = document.getElementById("app-container");
    if (appContainer) {
      // 隐藏Header和其他导航元素
      const header = appContainer.querySelector(
        ".header, header, .nav, .navigation"
      );
      if (header) {
        header.style.display = "none";
      }

      // 让当前页面覆盖整个容器
      appContainer.style.position = "static";
      appContainer.style.overflow = "visible";
    }

    // 设置body样式
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";

    // 初始化 Cesium Viewer
    viewer = new Cesium.Viewer("cesiumContainer", {
      // 使用默认的影像提供商，显示地球
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      skyBox: false,
      skyAtmosphere: false,
    });

    // 设置背景色
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#1a1a2e");

    // 显示地球，关闭透明度以确保卫星影像清晰
    viewer.scene.globe.show = true;
    viewer.scene.globe.translucency.enabled = false;
    // 开启深度检测，防止地形穿透
    viewer.scene.globe.depthTestAgainstTerrain = true;

    // 确保光照正常，避免背光面太黑
    viewer.scene.globe.enableLighting = false;

    // 地形夸张效果
    viewer.scene.globe.terrainExaggeration = 2.0;

    // 隐藏版权信息
    if (viewer._cesiumWidget && viewer._cesiumWidget._creditContainer) {
      viewer._cesiumWidget._creditContainer.style.display = "none";
    }

    // 设置初始视角
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(110, 35, 10000000), // 更高视角
    });

    console.log("Cesium Viewer initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Cesium Viewer:", error);
  }
});

onBeforeUnmount(() => {
  sceneLoadGuard.invalidate();

  // 清除高亮实体
  clearHighlightEntities();

  clearCurrentSceneDataSources();

  // 销毁事件处理器
  if (handler) {
    handler.destroy();
    handler = null;
  }

  // 恢复原始样式
  const appContainer = document.getElementById("app-container");
  if (appContainer) {
    const header = appContainer.querySelector(
      ".header, header, .nav, .navigation"
    );
    if (header) {
      header.style.display = "";
    }
    appContainer.style.position = "";
    appContainer.style.overflow = "";
  }

  // 恢复body样式
  document.body.style.margin = "";
  document.body.style.padding = "";
  document.body.style.overflow = "";

  if (viewer) {
    viewer.destroy();
  }
});
</script>

<style scoped>
.surface-container {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  position: relative;
  overflow: hidden;
  background-color: #1a1a2e;
}

.viewer {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.toolbar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.8);
  padding: 12px 20px;
  border: 1px solid #00d8ff;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 216, 255, 0.8);
  backdrop-filter: blur(4px);
  max-width: 95%;
  box-sizing: border-box;
  flex-wrap: wrap;
  justify-content: center;
}

.well-legend {
  position: absolute;
  top: 92px;
  left: 24px;
  z-index: 100;
  min-width: 210px;
  padding: 12px 14px;
  color: #cfeaff;
  background: rgba(3, 17, 29, 0.86);
  border: 1px solid rgba(0, 216, 255, 0.55);
  border-radius: 6px;
  backdrop-filter: blur(4px);
  pointer-events: none;
}

.legend-title {
  margin-bottom: 9px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 12px;
}

.legend-dot {
  width: 9px;
  height: 9px;
  border: 1px solid #ffffff;
  border-radius: 50%;
}

.legend-dot.research {
  background: #65f6c5;
}

.legend-dot.coordinate {
  background: #00d8ff;
}

.scene-buttons {
  display: flex;
  gap: 8px;
}

.scene-btn {
  padding: 8px 16px;
  cursor: pointer;
  background: transparent;
  color: #00d8ff;
  border: 1px solid #00d8ff;
  border-radius: 4px;
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.scene-btn:hover {
  background: #00d8ff;
  color: #000;
  box-shadow: 0 0 8px #00d8ff;
}

.scene-btn.active {
  background: #00d8ff;
  color: #000;
  box-shadow: 0 0 12px #00d8ff;
}

.action-select {
  padding: 8px 12px;
  background: transparent;
  color: #00d8ff;
  border: 1px solid #00d8ff;
  border-radius: 4px;
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-select:hover {
  background: #00d8ff;
  color: #000;
  box-shadow: 0 0 8px #00d8ff;
}

.underground-btn-container {
  position: absolute;
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: auto;
  max-width: 90%;
  display: flex;
  justify-content: center;
  padding-bottom: env(safe-area-inset-bottom);
}

.underground-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #00d8ff, #0088ff);
  color: #000;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 216, 255, 0.6);
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
  white-space: nowrap;
}

.underground-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 216, 255, 0.8);
}

.btn-icon {
  font-size: 18px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 16px rgba(0, 216, 255, 0.6);
  }

  50% {
    box-shadow: 0 4px 20px rgba(0, 216, 255, 0.8);
  }

  100% {
    box-shadow: 0 4px 16px rgba(0, 216, 255, 0.6);
  }
}

/* 深色主题适配 */
:deep(.cesium-viewer-bottom) {
  display: none !important;
}

:deep(.cesium-viewer-toolbar) {
  display: none !important;
}

:deep(.cesium-viewer-fullscreenContainer) {
  display: none !important;
}

:deep(.cesium-infoBox) {
  display: none !important;
}

.line-info-popup {
  position: absolute;
  z-index: 200;
  background: rgba(16, 29, 41, 0.9);
  border: 1px solid #00d8ff;
  border-radius: 4px;
  color: #fff;
  min-width: 250px;
  box-shadow: 0 0 15px rgba(0, 216, 255, 0.4);
  backdrop-filter: blur(4px);
  pointer-events: auto;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 216, 255, 0.3);
  background: rgba(0, 216, 255, 0.1);
}

.popup-header h3 {
  margin: 0;
  font-size: 14px;
  color: #00d8ff;
}

.close-btn {
  background: none;
  border: none;
  color: #00d8ff;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.popup-content {
  padding: 12px;
  font-size: 13px;
}

.info-item {
  display: flex;
  margin-bottom: 6px;
  line-height: 1.5;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #aaa;
  width: 70px;
  flex-shrink: 0;
}

.info-item .value {
  color: #fff;
  font-family: monospace;
}

@media screen and (max-width: 768px) {
  .toolbar {
    width: 90%;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }

  .scene-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .scene-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .underground-btn-container {
    bottom: 18%;
  }

  .underground-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}

@media screen and (max-height: 500px) {
  .toolbar {
    top: 5px;
    padding: 5px 10px;
  }

  .underground-btn-container {
    bottom: 20px;
  }

  .underground-btn {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>
