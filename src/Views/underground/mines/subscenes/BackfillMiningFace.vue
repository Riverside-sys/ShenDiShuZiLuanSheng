<!-- 填充回采工作面 -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Viewer, Color, Cartesian3, SceneMode } from "cesium";
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
let viewer = null;

// 模型路径
const modelPath = "/models/mines/BackfillMiningFace.glb";

// 元数据信息
const metadata = ref(getBaseMetadata("face"));

// 模型信息文件路径
const modelInfoPath = getModelInfoPath(modelPath);

// 面板标题
const panelTitle = getPanelTitle("face");

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

onMounted(async () => {
    try {
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
            imageryProvider: false,
            skyBox: false,
            skyAtmosphere: false,
        });
        viewer._cesiumWidget._creditContainer.style.display = "none";
        viewer.imageryLayers.removeAll();
        viewer.scene.globe.show = false;
        let modelLoaded = false;
        let modelEntity = null;
        try {
            modelEntity = viewer.entities.add({
                name: "BackfillMiningFace Model",
                position: Cartesian3.fromElements(0, 0, 0),
                model: {
                    uri: modelPath,
                    scale: 5.0,
                    shadows: true,
                    debugShowBoundingVolume: true,
                    color: Color.GRAY,
                    colorBlendMode: 2,
                },
            });
            await modelEntity.model.readyPromise;
            modelLoaded = true;
        } catch (error) {
            if (modelEntity) viewer.entities.remove(modelEntity);
        }
        viewer.camera.setView({
            destination: Cartesian3.fromElements(0, 20, 0),
            orientation: {
                heading: 0,
                pitch: -Math.PI / 2,
                roll: 0,
            },
        });
        viewer.scene.requestRender();
        viewer.camera.changed.addEventListener(updateScale);
        updateScale();
        setTimeout(() => {
            updateScale();
            viewer.scene.requestRender();
        }, 1000);
    } catch (error) {}
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
