<!-- 地质分层 -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
    Viewer,
    SceneMode,
    Cartesian3,
    Entity,
    HeadingPitchRoll,
    Transforms,
    Math as CesiumMath,
    Matrix4,
    Color,
    ScreenSpaceEventType,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

const cesiumContainer = ref(null);
let viewer = null;

// 地层信息相关
const showLayerInfo = ref(false);
const selectedLayerInfo = ref({});
const selectedLayerId = ref(null);

// 地层选择器相关变量
const showLayerSelector = ref(false);
const selectedSingleLayer = ref(null);
const isLoading = ref(false);

// 状态管理
const isExpanded = ref(false); // 是否已展开
const isPerspectiveMode = ref(false); // 是否处于透视模式
const perspectiveLayerId = ref(0); // 当前透视的图层ID

// 存储所有地层的实体
let allLayerEntities = [];
let currentSingleEntity = null;

// 地层名称列表
const layerNames = [
    "杂填层",
    "粉质黏土",
    "粉砂",
    "细沙",
    "粉质黏土",
    "细沙",
    "粉砂",
    "粉质黏土",
    "粉质黏土",
];

// 生成随机的地层信息
function generateLayerInfo(layerId) {
    const layerTypes = ["砂岩", "页岩", "石灰岩", "煤层", "粉砂岩", "泥岩"];
    const randomType =
        layerTypes[Math.floor(Math.random() * layerTypes.length)];
    let layerName = "未知地层";
    if (layerId >= 0 && layerId < layerNames.length) {
        layerName = layerNames[layerId];
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

// 加载单个地层模型
async function loadLayerModel(index, baseHeight = 60) {
    const url = `/models/mines/GeologicalStratification/diceng${index}/0.glb`;
    console.log(`正在加载地层 ${index}: ${url}`);

    // 计算每个地层的位置，默认状态下每个地层间隔10米
    const layerHeight = baseHeight + index * 10;

    const position = Cartesian3.fromDegrees(
        117.22089726144343,
        31.833569328835598,
        layerHeight
    );
    const heading = CesiumMath.toRadians(0);
    const pitch = CesiumMath.toRadians(-90);
    const roll = CesiumMath.toRadians(90);
    const hpr = new HeadingPitchRoll(heading, pitch, roll);
    const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

    const entity = await viewer.entities.add({
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

// 加载所有地层
async function loadAllLayers() {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
        // 清除现有实体
        clearAllEntities();

        // 加载所有地层
        for (let i = 0; i < layerNames.length; i++) {
            try {
                const entity = await loadLayerModel(i);
                allLayerEntities.push(entity);
                console.log(`地层 ${i} 加载成功，实体:`, entity);

                // 检查模型状态
                if (entity.model) {
                    console.log(`地层 ${i} 模型状态:`, {
                        ready: entity.model.ready,
                        show: entity.model.show,
                        uri: entity.model.uri,
                    });
                }
            } catch (e) {
                console.error(`加载地层 ${i} 失败:`, e);
            }
        }

        // 聚焦到第一个地层
        if (allLayerEntities.length > 0) {
            viewer.trackedEntity = allLayerEntities[0];
            await viewer.zoomTo(allLayerEntities[0]);
        }

        console.log(`所有地层加载完成，共 ${allLayerEntities.length} 个`);
    } catch (error) {
        console.error("加载所有地层失败:", error);
    } finally {
        isLoading.value = false;
    }
}

// 清除所有实体
function clearAllEntities() {
    // 清除所有地层实体
    allLayerEntities.forEach((entity) => {
        if (entity && viewer.entities.contains(entity)) {
            viewer.entities.remove(entity);
        }
    });
    allLayerEntities = [];

    // 清除单个显示实体
    if (currentSingleEntity && viewer.entities.contains(currentSingleEntity)) {
        viewer.entities.remove(currentSingleEntity);
        currentSingleEntity = null;
    }
}

// 展开地层
function expandLayers() {
    if (isExpanded.value) return; // 已经展开，不再执行

    isExpanded.value = true;
    let animationStep = 0;
    const maxSteps = 10;

    const animate = () => {
        if (animationStep >= maxSteps) return;

        allLayerEntities.forEach((entity, index) => {
            if (entity && entity.position) {
                const currentPosition = entity.position.getValue(
                    viewer.clock.currentTime
                );
                if (currentPosition) {
                    // 计算展开后的位置，每个地层间隔增加到50米
                    const expandedHeight = 60 + index * 20;
                    const newPosition = Cartesian3.fromDegrees(
                        117.22089726144343,
                        31.833569328835598,
                        expandedHeight
                    );

                    // 更新位置
                    entity.position = newPosition;
                }
            }
        });

        animationStep++;
        if (animationStep < maxSteps) {
            requestAnimationFrame(animate);
        }
    };

    animate();
    console.log("地层展开完成");
}

// 关闭地层
function closeLayers() {
    if (!isExpanded.value) return; // 已经关闭，不再执行

    isExpanded.value = false;
    let animationStep = 0;
    const maxSteps = 10;

    const animate = () => {
        if (animationStep >= maxSteps) return;

        allLayerEntities.forEach((entity, index) => {
            if (entity && entity.position) {
                const currentPosition = entity.position.getValue(
                    viewer.clock.currentTime
                );
                if (currentPosition) {
                    // 计算关闭后的位置，恢复到默认间隔10米
                    const closedHeight = 60 + index * 10;
                    const newPosition = Cartesian3.fromDegrees(
                        117.22089726144343,
                        31.833569328835598,
                        closedHeight
                    );

                    // 更新位置
                    entity.position = newPosition;
                }
            }
        });

        animationStep++;
        if (animationStep < maxSteps) {
            requestAnimationFrame(animate);
        }
    };

    animate();
    console.log("地层关闭完成");
}

// 切换透视模式
function togglePerspectiveMode() {
    console.log("切换透视模式，当前状态:", isPerspectiveMode.value);
    console.log("当前地层数量:", allLayerEntities.length);

    // 如果当前是单独显示模式，先退出
    if (selectedSingleLayer.value !== null) {
        console.log("退出单独显示模式");
        // 退出单独显示模式，恢复所有地层显示
        if (
            currentSingleEntity &&
            viewer.entities.contains(currentSingleEntity)
        ) {
            viewer.entities.remove(currentSingleEntity);
            currentSingleEntity = null;
        }

        // 显示所有地层
        allLayerEntities.forEach((entity) => {
            if (entity) entity.show = true;
        });

        selectedSingleLayer.value = null;
    }

    isPerspectiveMode.value = !isPerspectiveMode.value;

    if (isPerspectiveMode.value) {
        console.log("进入透视模式");
        // 进入透视模式，默认透视除第一层外的所有地层
        applyPerspective(0);
    } else {
        console.log("退出透视模式");
        // 退出透视模式，恢复所有地层透明度
        clearPerspective();
    }
}

// 应用透视效果
function applyPerspective(targetLayerId) {
    perspectiveLayerId.value = targetLayerId;

    allLayerEntities.forEach((entity, index) => {
        if (entity && entity.model) {
            if (index === targetLayerId) {
                // 目标地层保持不透明（不改色，乘以白色）
                entity.model.color = Color.WHITE;
                console.log(`地层 ${index} 设置为不透明`);
            } else {
                // 其他地层设置为半透明
                entity.model.color = Color.WHITE.withAlpha(0.3);
                console.log(`地层 ${index} 设置为半透明`);
            }
        }
    });

    console.log(`透视模式：地层 ${targetLayerId} 保持不透明，其他地层半透明`);
}

// 清除透视效果
function clearPerspective() {
    allLayerEntities.forEach((entity) => {
        if (entity && entity.model) {
            entity.model.color = Color.WHITE;
        }
    });

    console.log("清除透视效果");
}

// 切换地层选择器显示
function toggleLayerSelector() {
    showLayerSelector.value = !showLayerSelector.value;
}

// 单独显示某一个地层
async function showOnlyLayer(index) {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
        selectedSingleLayer.value = index;

        // 退出透视模式
        if (isPerspectiveMode.value) {
            isPerspectiveMode.value = false;
            clearPerspective();
        }

        // 隐藏所有地层
        allLayerEntities.forEach((entity) => {
            if (entity) entity.show = false;
        });

        // 删除已加载的单层实体
        if (
            currentSingleEntity &&
            viewer.entities.contains(currentSingleEntity)
        ) {
            viewer.entities.remove(currentSingleEntity);
            currentSingleEntity = null;
        }

        // 加载单个地层
        currentSingleEntity = await loadLayerModel(index);

        viewer.trackedEntity = currentSingleEntity;
        await viewer.zoomTo(currentSingleEntity);

        console.log(`地层 ${index} 单独显示成功`);
    } catch (e) {
        console.error(`加载地层 ${index} 失败:`, e);
        alert(`加载地层 ${index} 失败，请检查文件是否存在`);
    } finally {
        isLoading.value = false;
    }
}

// 重置视图到默认状态
async function resetView() {
    try {
        // 清除所有实体
        clearAllEntities();

        // 重置状态
        isExpanded.value = false;
        isPerspectiveMode.value = false;
        perspectiveLayerId.value = 0;
        selectedSingleLayer.value = null;
        selectedLayerId.value = null;
        showLayerInfo.value = false;
        showLayerSelector.value = false;

        // 重新加载所有地层
        await loadAllLayers();

        console.log("视图重置完成");
    } catch (error) {
        console.error("重置视图失败:", error);
    }
}

// 处理地层点击事件
function handleLayerClick(layerId) {
    if (isPerspectiveMode.value) {
        // 透视模式下，点击地层切换透视目标
        applyPerspective(layerId);
    } else {
        // 非透视模式下，显示地层信息
        selectedLayerId.value = layerId;
        selectedLayerInfo.value = generateLayerInfo(layerId);
        showLayerInfo.value = true;
        console.log("选中地层:", layerId);
    }
}

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
        viewer.scene.globe.depthTestAgainstTerrain = true;

        // 确保模型正确渲染
        viewer.scene.globe.enableLighting = false;
        viewer.scene.fog.enabled = false;
        if (viewer.scene.skyAtmosphere) {
            viewer.scene.skyAtmosphere.show = false;
        }
        setTimeout(() => {
            var iframe = document.getElementsByClassName(
                "cesium-infoBox-iframe"
            )[0];
            if (iframe) {
                iframe.setAttribute(
                    "sandbox",
                    "allow-same-origin allow-scripts allow-popups allow-forms"
                );
                iframe.setAttribute("src", "");
            }
        }, 500);

        // 加载所有地层
        await loadAllLayers();

        // 添加点击事件监听
        viewer.screenSpaceEventHandler.setInputAction((movement) => {
            const pickedFeature = viewer.scene.pick(movement.position);
            if (pickedFeature && pickedFeature.id) {
                console.log("点击了实体:", pickedFeature.id);

                // 找到点击的地层索引
                let layerIndex = allLayerEntities.findIndex(
                    (entity) => entity === pickedFeature.id
                );

                // 如果没找到，可能是单独显示的实体
                if (
                    layerIndex === -1 &&
                    currentSingleEntity === pickedFeature.id
                ) {
                    layerIndex = selectedSingleLayer.value;
                }

                if (layerIndex !== -1) {
                    console.log("找到地层索引:", layerIndex);
                    handleLayerClick(layerIndex);
                } else {
                    console.log("未找到对应的地层索引");
                }
            }
        }, ScreenSpaceEventType.LEFT_CLICK);
    } catch (error) {
        console.error("初始化失败:", error);
    }
});

onBeforeUnmount(() => {
    if (viewer) {
        viewer.destroy();
    }
});

// 返回主场景
const handleBack = () => {
    // 通知主场景关闭子场景
    window.dispatchEvent(new CustomEvent("mine-subscene-close"));
};
</script>

<template>
    <div class="viewer-container">
        <div ref="cesiumContainer" class="cesium-container"></div>

        <!-- 主要功能按钮 -->
        <button class="layer-btn layer-btn-back" @click="handleBack">
            返回
        </button>
        <button
            class="layer-btn layer-btn-expand"
            @click="expandLayers"
            :disabled="isExpanded"
        >
            展开地层
        </button>
        <button
            class="layer-btn layer-btn-close"
            @click="closeLayers"
            :disabled="!isExpanded"
        >
            关闭地层
        </button>
        <button
            class="layer-btn layer-btn-perspective"
            @click="togglePerspectiveMode"
            :class="{ active: isPerspectiveMode }"
        >
            {{ isPerspectiveMode ? "取消透视" : "透视模式" }}
        </button>
        <button
            class="layer-btn layer-btn-selector"
            @click="toggleLayerSelector"
        >
            选择地层
        </button>
        <button class="layer-btn layer-btn-reset" @click="resetView">
            重置视图
        </button>

        <!-- 地层选择器面板 -->
        <div v-if="showLayerSelector" class="layer-selector-panel">
            <h3>选择要显示的地层</h3>
            <button class="close-btn" @click="showLayerSelector = false">
                ×
            </button>
            <div class="layer-list">
                <button
                    v-for="(layerName, index) in layerNames"
                    :key="index"
                    @click="showOnlyLayer(index)"
                    :disabled="isLoading"
                    :class="{ active: selectedSingleLayer === index }"
                    class="layer-select-btn"
                >
                    {{ layerName }} ({{ index }})
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
    </div>
</template>

<style>
.viewer-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
}
.cesium-container {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 0;
    background: #000;
    z-index: 1;
}
.layer-btn {
    position: absolute;
    right: 32px;
    min-width: 90px;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 6px;
    border: 1px solid #17c7fe;
    background: #101d29;
    color: #17c7fe;
    font-weight: 600;
    cursor: pointer;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    margin-bottom: 8px;
    outline: none;
    transition: background 0.2s, color 0.2s;
}
.layer-btn-back {
    top: 32px;
}
.layer-btn-expand {
    top: 80px;
}
.layer-btn-close {
    top: 128px;
}
.layer-btn-perspective {
    top: 176px;
}
.layer-btn-selector {
    top: 224px;
}
.layer-btn-reset {
    top: 272px;
}
.layer-btn:hover:not(:disabled) {
    background: #17c7fe;
    color: #101d29;
    border-color: #17c7fe;
}
.layer-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.layer-btn.active {
    background: #17c7fe;
    color: #101d29;
    border-color: #17c7fe;
}

/* 地层选择器面板样式 */
.layer-selector-panel {
    position: absolute;
    top: 320px;
    right: 32px;
    background: rgba(16, 29, 41, 0.92);
    border-radius: 14px;
    padding: 20px 18px 16px 18px;
    width: 280px;
    max-height: 400px;
    overflow-y: auto;
    box-shadow: 0 4px 24px 0 rgba(23, 199, 254, 0.18),
        0 1.5px 8px 0 rgba(0, 0, 0, 0.25);
    border: 1.5px solid #17c7fe;
    z-index: 10;
    backdrop-filter: blur(2px);
}

.layer-selector-panel h3 {
    margin-top: 0;
    margin-bottom: 18px;
    color: #17c7fe;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 0 0 8px #17c7fe44;
}

.layer-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.layer-select-btn {
    padding: 12px 16px;
    background: rgba(16, 29, 41, 0.8);
    border: 1px solid #22384a;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    color: #eaf6ff;
    font-size: 14px;
    font-weight: 500;
}

.layer-select-btn:hover {
    background: rgba(23, 199, 254, 0.1);
    border-color: #17c7fe;
    color: #17c7fe;
}

.layer-select-btn.active {
    background: rgba(23, 199, 254, 0.2);
    border-color: #17c7fe;
    color: #17c7fe;
    box-shadow: 0 0 12px rgba(23, 199, 254, 0.3);
}

.layer-select-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.layer-info-panel {
    position: absolute;
    top: 320px;
    right: 32px;
    background: rgba(16, 29, 41, 0.92);
    border-radius: 14px;
    padding: 20px 18px 16px 18px;
    width: 260px;
    box-shadow: 0 4px 24px 0 rgba(23, 199, 254, 0.18),
        0 1.5px 8px 0 rgba(0, 0, 0, 0.25);
    border: 1.5px solid #17c7fe;
    z-index: 10;
    backdrop-filter: blur(2px);
}
.layer-info-panel h3 {
    margin-top: 0;
    margin-bottom: 18px;
    color: #17c7fe;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 0 0 8px #17c7fe44;
}
.layer-info-panel table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}
.layer-info-panel th,
.layer-info-panel td {
    padding: 10px 8px;
    text-align: left;
    border-bottom: 1px solid #22384a;
    font-size: 15px;
    color: #eaf6ff;
    transition: background 0.2s, color 0.2s;
}
.layer-info-panel th {
    background: #112233;
    color: #17c7fe;
    font-weight: 700;
    font-size: 15.5px;
    border-bottom: 2px solid #17c7fe;
    letter-spacing: 0.5px;
}
/* hover高亮 */
.layer-info-panel tr:hover td {
    background: rgba(23, 199, 254, 0.08);
    color: #17c7fe;
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
    text-shadow: 0 0 6px #17c7fe44;
}
.close-btn:hover {
    color: #fff;
}

/* 全局修复：强制所有全屏 pointer-events: none 的 div 可交互 */
div[style*="pointer-events: none"][style*="width: 100%"] {
    pointer-events: auto !important;
    background: none !important;
}
</style>
