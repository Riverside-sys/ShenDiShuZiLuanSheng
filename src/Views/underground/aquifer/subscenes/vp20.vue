<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
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

// 屏幕像素物理尺寸（96DPI 情况下约 0.264583mm/px）
const METERS_PER_PIXEL_SCREEN = 0.000264583;

// 模型路径（保持不变或调整为环境变量）
const modelPath = "/models/aquifer/demo/vp20.glb";

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
        if (!modelEntity || width <= 0 || height <= 0) {
            scaleText.value = "比例尺: 1:1000";
            return;
        }
        // 以模型中心为参考计算 metersPerPixel（避免仅用相机高度导致偏差）
        const center = Cartesian3.fromElements(0, 0, 0);
        const distance = Cartesian3.distance(camera.position, center);
        const fov = camera.frustum.fov;
        const aspectRatio = width / height;
        const frustumWidth = 2 * distance * Math.tan(fov / 2) * aspectRatio;
        const metersPerPixel = frustumWidth / width;
        // 转换为屏幕比例尺（1:N），N = 屏幕每像素物理米数的倍数
        let scale = metersPerPixel / METERS_PER_PIXEL_SCREEN;
        // 美化取整（四舍五入至最近的 10）
        scale = Math.max(1, Math.round(scale / 10) * 10);
        scaleText.value = `比例尺: 1:${scale.toLocaleString()}`;
        viewer.scene.requestRender();
    } catch (error) {
        scaleText.value = "比例尺: 1:1000";
    }
};

// 分析面板状态（上方：2D/3D；下方：FWI/测井约束FWI）
const analysisPrimary = ref("2d"); // '2d' | '3d'
const analysisSecondary = ref("main"); // 预留，当前仅 1 张
const fwiPrimary = ref("fwi"); // 'fwi' | 'fwiLogging'

const analysisImageSrc = computed(() =>
    analysisPrimary.value === "2d"
        ? "/images/aquifer/demo/vp20_2D_analysis.png"
        : "/images/aquifer/demo/vp20_3D_analysis.png"
);
const fwiImageSrc = computed(() =>
    fwiPrimary.value === "fwi"
        ? "/images/aquifer/demo/vp20_全波形反演.png"
        : "/images/aquifer/demo/vp20_测井约束全波形反演.png"
);

// 图片预览弹窗
const imgPreviewVisible = ref(false);
const imgPreviewSrc = ref("");
const openImagePreview = (src) => {
    imgPreviewSrc.value = typeof src === "string" ? src : src.value;
    imgPreviewVisible.value = true;
};
const closeImagePreview = () => {
    imgPreviewVisible.value = false;
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
        let modelEntity = null;
        try {
            modelEntity = viewer.entities.add({
                name: "vp20 Model",
                position: Cartesian3.fromElements(0, 0, 0),
                model: {
                    uri: modelPath,
                    scale: 1.0,
                    minimumPixelSize: 64,
                    maximumScale: 20000,
                    shadows: false,
                    debugShowBoundingVolume: false,
                    color: Color.WHITE,
                },
            });
            await modelEntity.model.readyPromise;
        } catch (error) {
            if (modelEntity) viewer.entities.remove(modelEntity);
        }
        // 优先缩放到模型全貌
        try {
            await viewer.zoomTo(modelEntity);
        } catch (_) {
            viewer.camera.setView({
                destination: Cartesian3.fromElements(120, 120, 120),
                orientation: { heading: 0, pitch: -Math.PI / 4, roll: 0 },
            });
        }
        // 优化缩放行为与可见性
        viewer.scene.requestRender();
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 0.05;
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1e8;
        try {
            viewer.camera.frustum.near = 0.05;
            viewer.camera.frustum.far = 1e9;
            viewer.scene.logarithmicDepthBuffer = true;
        } catch (_) {}
        // 渲染模式优化
        try {
            viewer.scene.requestRenderMode = true;
            viewer.scene.maximumRenderTimeChange = Infinity;
        } catch (_) {}
        viewer.camera.changed.addEventListener(updateScale);
        updateScale();
        setTimeout(() => {
            updateScale();
            viewer.scene.requestRender();
        }, 500);
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

const handleBack = () => {
    // 通知主场景关闭子场景
    window.dispatchEvent(new CustomEvent("aquifer-subscene-close"));
};

const onResetView = async () => {
    if (!viewer) return;
    const entity = viewer.entities.values[0];
    if (entity) {
        try {
            await viewer.zoomTo(entity);
        } catch (_) {
            viewer.camera.setView({
                destination: Cartesian3.fromElements(120, 120, 120),
                orientation: { heading: 0, pitch: -Math.PI / 4, roll: 0 },
            });
        }
        // 重置缩放限制
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 0.05;
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1e8;
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

        <!-- 上方分析面板：2D/3D 分析图 -->
        <div class="analysis-panel top-panel">
            <div class="panel-tabs">
                <div
                    class="tab-item"
                    :class="{ active: analysisPrimary === '2d' }"
                    @click="analysisPrimary = '2d'"
                >
                    2D 分析
                </div>
                <div
                    class="tab-item"
                    :class="{ active: analysisPrimary === '3d' }"
                    @click="analysisPrimary = '3d'"
                >
                    3D 分析
                </div>
            </div>
            <div class="panel-image">
                <img
                    :src="analysisImageSrc"
                    alt="分析图"
                    @click="openImagePreview(analysisImageSrc)"
                />
            </div>
        </div>

        <!-- 下方分析面板：FWI 系列 -->
        <div class="analysis-panel bottom-panel">
            <div class="panel-tabs">
                <div
                    class="tab-item"
                    :class="{ active: fwiPrimary === 'fwi' }"
                    @click="fwiPrimary = 'fwi'"
                >
                    全波形反演
                </div>
                <div
                    class="tab-item"
                    :class="{ active: fwiPrimary === 'fwiLogging' }"
                    @click="fwiPrimary = 'fwiLogging'"
                >
                    测井约束全波形反演
                </div>
            </div>
            <div class="panel-image">
                <img
                    :src="fwiImageSrc"
                    alt="FWI 分析图"
                    @click="openImagePreview(fwiImageSrc)"
                />
            </div>
        </div>

        <!-- 左侧竖直工具栏：返回 + 面板显隐 -->
        <div class="left-tools">
            <button class="tool-btn" @click="handleBack">返回</button>
            <button class="tool-btn" @click="togglePanel">
                {{ showMetadata ? "隐藏面板" : "显示面板" }}
            </button>
            <button class="tool-btn" @click="onResetView">重置视图</button>
            <div class="scale-badge">{{ scaleText }}</div>
        </div>

        <!-- 图片预览弹窗 -->
        <div
            v-if="imgPreviewVisible"
            class="img-modal-overlay"
            @click="closeImagePreview"
        >
            <div class="img-modal" @click.stop>
                <button class="img-modal-close" @click="closeImagePreview">
                    ×
                </button>
                <img
                    :src="imgPreviewSrc"
                    alt="预览图"
                    class="img-modal-image"
                />
            </div>
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

/* 上/下分析面板，宽度与 MetadataPanel 一致（320px），右侧对齐 */
.analysis-panel {
    position: absolute;
    right: 20px;
    width: 320px;
    background: rgba(16, 29, 41, 0.95);
    border: 1px solid rgba(23, 199, 254, 0.3);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    padding: 12px;
    z-index: 1000;
    pointer-events: auto;
}
.top-panel {
    top: 76px;
    height: 280px;
}
/* 覆盖属性面板位置，并保持一致间距 */
:deep(.metadata-panel) {
    top: 380px;
}
/* 属性面板高度 400px，下方面板与其间距 24px */
.bottom-panel {
    top: calc(380px + 400px + 24px);
}

.panel-tabs,
.panel-subtabs {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(23, 199, 254, 0.2);
    padding-bottom: 8px;
}
.tab-item,
.subtab-item {
    flex: 1;
    padding: 6px 8px;
    text-align: center;
    color: #8a9ba8;
    font-size: 13px;
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 6px;
    transition: all 0.2s ease;
}
.tab-item:hover,
.subtab-item:hover {
    color: #17c7fe;
    background: rgba(23, 199, 254, 0.1);
    border-color: rgba(23, 199, 254, 0.2);
}
.tab-item.active,
.subtab-item.active {
    color: #17c7fe;
    background: rgba(23, 199, 254, 0.1);
    border-color: rgba(23, 199, 254, 0.3);
}

.panel-image {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(23, 199, 254, 0.2);
    border-radius: 6px;
    padding: 8px;
    text-align: center;
}
.panel-image img {
    max-width: 100%;
    max-height: 200px;
    cursor: zoom-in;
    border-radius: 4px;
}

/* 左侧工具垂直按钮组，位置右移避免被主左侧面板遮挡 */
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
}
.tool-btn:hover {
    background: #17c7fe;
    color: #101d29;
}

.scale-badge {
    min-width: 100px;
    background: rgba(16, 29, 41, 0.95);
    border: 1px solid rgba(23, 199, 254, 0.3);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    color: #17c7fe;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    text-align: center;
}

/* 图片预览弹窗 */
.img-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}
.img-modal {
    position: relative;
    background: #101d29;
    border: 1px solid rgba(23, 199, 254, 0.3);
    border-radius: 10px;
    padding: 10px;
    max-width: 90vw;
    max-height: 90vh;
}
.img-modal-image {
    max-width: 86vw;
    max-height: 80vh;
    border-radius: 6px;
}
.img-modal-close {
    position: absolute;
    top: 6px;
    right: 8px;
    background: none;
    border: none;
    font-size: 24px;
    color: #17c7fe;
    cursor: pointer;
}
</style>
