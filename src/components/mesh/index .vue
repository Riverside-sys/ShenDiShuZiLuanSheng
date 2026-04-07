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
import MetadataPanel from "./MetadataPanel.vue";

const cesiumContainer = ref(null);
const showMetadata = ref(true);
const scaleText = ref("比例尺: 1:0");
// 用于在卸载时销毁
let viewer = null;

// 元数据信息
const metadata = ref({
    dataSource: "LiDAR 点云 (2024年采集)",
    algorithm: "多尺度高斯滤波 + 三维重构",
    verticalAccuracy: "±0.15米",
    horizontalAccuracy: "±0.2米",
    resolution: "0.5米（主要区域）至1米（边缘区域）",
});

// 计算比例尺
const updateScale = () => {
    if (!viewer) return;

    // 获取当前相机信息
    const camera = viewer.camera;
    const canvas = viewer.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // 获取模型实体
    const modelEntity = viewer.entities.values[0];
    if (!modelEntity || !modelEntity.model) return;
   console.log(modelEntity);
    // 获取相机位置和方向
    const cameraPosition = camera.position;
    const cameraDirection = camera.direction;
    const cameraUp = camera.up;

    // 计算视锥体参数
    const fov = camera.frustum.fov;
    const aspectRatio = width / height;

    // 计算相机到原点的距离（假设模型在原点）
    const distance = Cartesian3.magnitude(cameraPosition);

    // 计算视锥体在相机位置处的宽度（米）
    const frustumWidth = 2 * distance * Math.tan(fov / 2) * aspectRatio;

    // 计算每像素代表的实际距离（米/像素）
    const metersPerPixel = frustumWidth / width;

    // 计算比例尺（假设屏幕宽度为1000像素）
    const scale = Math.round(1000 * metersPerPixel);

    // 更新比例尺文本
    scaleText.value = `比例尺: 1:${scale.toLocaleString()}`;
};

onMounted(async () => {
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

    // 隐藏默认的logo和版权信息
    viewer._cesiumWidget._creditContainer.style.display = "none";

    // 移除默认的影像图层
    viewer.imageryLayers.removeAll();
    viewer.scene.globe.show = false;

    const modelUrl = "./mesh/hc_c312_blendered.glb";

    // 创建模型实体
    const modelEntity = viewer.entities.add({
        name: "Mesh Model",
        position: Cartesian3.fromDegrees(0, 0, 0),
        model: {
            uri: modelUrl,
            minimumPixelSize: 10240,
            scale: 5.0,
            shadows: true,
            debugShowBoundingVolume: true,
            color: Color.WHITE,
            colorBlendMode: 2,
            colorBlendAmount: 0.5,
            maximumScale: 51200,
        },
    });

    // 等待模型加载完成
    try {
        await modelEntity.model.readyPromise;
        console.log("模1型加载完成");
          console.log(modelEntity.model);
            console.log("模型加载完成");

        // 获取模型的包围盒
        const boundingSphere = modelEntity.model.boundingSphere;
        if (boundingSphere) {
            console.log("模型包围盒:", boundingSphere);

            // 设置相机位置在模型上方
            const center = boundingSphere.center;
            const radius = boundingSphere.radius;

            viewer.camera.setView({
                destination: Cartesian3.add(
                    center,
                    new Cartesian3(0, 0, radius * 2),
                    new Cartesian3()
                ),
                orientation: {
                    heading: 0,
                    pitch: -Math.PI / 3,
                    roll: 0,
                },
            });

            // 设置相机限制
            viewer.scene.screenSpaceCameraController.minimumZoomDistance =
                radius * 0.5;
            viewer.scene.screenSpaceCameraController.maximumZoomDistance =
                radius * 5;
        }

        // 启用鼠标控制
        viewer.scene.screenSpaceCameraController.enableRotate = true;
        viewer.scene.screenSpaceCameraController.enableTranslate = true;
        viewer.scene.screenSpaceCameraController.enableZoom = true;
        viewer.scene.screenSpaceCameraController.enableTilt = true;

        // 监听相机变化，更新比例尺
        viewer.camera.changed.addEventListener(updateScale);
        // 初始更新一次比例尺
        updateScale();
    } catch (error) {
        console.error("模型加载失败:", error);
    }
});

onBeforeUnmount(() => {
    if (viewer) {
        viewer.destroy();
    }
});
</script>

<template>
    <div class="viewer-container">
        <div ref="cesiumContainer" class="cesium-container"></div>
        <MetadataPanel
            v-model:showMetadata="showMetadata"
            :metadata="metadata"
        />
        <div class="scale-bar">
            {{ scaleText }}
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
}

.scale-bar {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}
</style>
