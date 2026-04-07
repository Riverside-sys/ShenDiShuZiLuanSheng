<!-- 避难硐室 -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
    Viewer,
    Color,
    Cartesian3,
    HeadingPitchRange,
    Entity,
    SceneMode,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import MetadataPanel from "../MetadataPanel.vue";
import {
    getBaseMetadata,
    getPanelTitle,
    getModelInfoPath,
} from "@/utils/modelInfoLoader.js";

const cesiumContainer = ref(null);
const showMetadata = ref(true);
const scaleText = ref("比例尺: 1:0");
// 用于在卸载时销毁
let viewer = null;

// 模型路径
const modelPath = "/models/mines/EmergencyRefugeChamber.glb";

// 元数据信息
const metadata = ref(getBaseMetadata("cave"));

// 模型信息文件路径
const modelInfoPath = getModelInfoPath(modelPath);

// 面板标题
const panelTitle = getPanelTitle("cave");

// 计算比例尺
const updateScale = () => {
    if (!viewer) return;

    try {
        // 获取当前相机信息
        const camera = viewer.camera;
        const canvas = viewer.canvas;
        const width = canvas.width;
        const height = canvas.height;

        // 获取模型实体
        const modelEntity = viewer.entities.values[0];
        if (!modelEntity) {
            console.log("未找到模型实体，使用默认比例尺");
            scaleText.value = "比例尺: 1:1000";
            return;
        }

        // 获取相机位置
        const cameraPosition = camera.position;

        // 计算相机到原点的距离（模型在原点）
        const distance = Cartesian3.magnitude(cameraPosition);

        // 计算视锥体参数
        const fov = camera.frustum.fov;
        const aspectRatio = width / height;

        // 计算视锥体在相机位置处的宽度（米）
        const frustumWidth = 2 * distance * Math.tan(fov / 2) * aspectRatio;

        // 计算每像素代表的实际距离（米/像素）
        const metersPerPixel = frustumWidth / width;

        // 计算比例尺（1:实际距离）
        const scale = Math.round(metersPerPixel);

        // 更新比例尺文本
        scaleText.value = `比例尺: 1:${scale.toLocaleString()}`;
        console.log("比例尺更新:", scaleText.value);
    } catch (error) {
        console.error("比例尺计算失败:", error);
        scaleText.value = "比例尺: 1:1000";
    }
};

onMounted(async () => {
    try {
        console.log("开始初始化 EmergencyRefugeChamber Viewer");
        console.log("容器元素:", cesiumContainer.value);

        if (!cesiumContainer.value) {
            console.error("容器元素未找到");
            return;
        }

        // 禁用所有默认控件
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
            imageryProvider: false,
            skyBox: false,
            skyAtmosphere: false,
        });

        console.log("Cesium Viewer 创建成功");

        // 隐藏默认的logo和版权信息
        viewer._cesiumWidget._creditContainer.style.display = "none";

        // 移除默认的影像图层
        viewer.imageryLayers.removeAll();
        viewer.scene.globe.show = false;

        // 加载模型
        let modelLoaded = false;
        let modelEntity = null;
        try {
            console.log(`尝试加载模型: ${modelPath}`);
            modelEntity = viewer.entities.add({
                name: "EmergencyRefugeChamber Model",
                position: Cartesian3.fromElements(0, 0, 0),
                model: {
                    uri: modelPath,
                    scale: 15,
                    shadows: true,
                    debugShowBoundingVolume: true,
                    color: Color.GRAY,
                    colorBlendMode: 2,
                },
            });
            await modelEntity.model.readyPromise;
            console.log(`模型加载成功: ${modelPath}`);
            modelLoaded = true;
        } catch (error) {
            console.warn(`模型加载失败: ${modelPath}`, error);
            if (modelEntity) viewer.entities.remove(modelEntity);
        }

        // 设置相机位置
        viewer.camera.setView({
            destination: Cartesian3.fromElements(0, 45, 0),
            orientation: {
                heading: 0,
                pitch: -Math.PI / 2,
                roll: 0,
            },
        });

        // 强制渲染一帧
        viewer.scene.requestRender();

        // 监听相机变化，更新比例尺
        viewer.camera.changed.addEventListener(updateScale);
        // 初始更新一次比例尺
        updateScale();

        // 延迟再次更新比例尺，确保模型已加载
        setTimeout(() => {
            updateScale();
            viewer.scene.requestRender();
        }, 1000);

        console.log("EmergencyRefugeChamber Viewer 初始化完成");
    } catch (error) {
        console.error("EmergencyRefugeChamber Viewer 初始化失败:", error);
    }
});

onBeforeUnmount(() => {
    if (viewer) {
        viewer.destroy();
    }
});

// 切换面板显示
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
                destination: Cartesian3.fromElements(0, 45, 0),
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
        <MetadataPanel
            v-model:showMetadata="showMetadata"
            :metadata="metadata"
            :modelInfoPath="modelInfoPath"
            :panelTitle="panelTitle"
        />
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
