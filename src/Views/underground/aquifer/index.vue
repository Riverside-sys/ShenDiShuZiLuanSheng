<!--
  含水层场景入口：集成煤矿地质分层功能，使用独立的地层模型（diceng0-diceng8），
  同时保留含水层原有的跳转、预览、子场景等特殊功能。
-->
<script setup>
import {
    Viewer,
    SceneMode,
    Matrix4,
    Cartesian3,
    Cesium3DTileset,
    Cesium3DTileStyle,
    ScreenSpaceEventType,
    SceneTransforms,
    Entity,
    HeadingPitchRoll,
    Transforms,
    Math as CesiumMath,
    Color,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import Vp20 from "./subscenes/vp20.vue";
import Vp40 from "./subscenes/vp40.vue";
import Vp100 from "./subscenes/vp100.vue";
import Vp250 from "./subscenes/vp250.vue";

// 容器与Cesium实例
const cesiumContainer = ref(null);
let viewer = null;
let tileset = null;

// 可配置的 tileset 路径（优先使用环境变量）
const TILESET_URL =
    import.meta.env.VITE_AQUIFER_TILESET_URL ||
    "/models/aquifer/demo/GeologicalStratification/tileset.json";

// 分层展开控制（tileset模式，保留以备用）
const originalTransforms = new Map();
const maxSpread = 5;
let currentSpread = 0;
let targetDepth = 1;
const VISIBLE_LAYER_COUNT = 4;

// 独立地层模型控制（新增）
let allLayerEntities = [];
let currentSingleEntity = null;
const isLoading = ref(false);

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

// 状态管理
const isExpanded = ref(false); // 是否已展开
const selectedSingleLayer = ref(null); // 当前单独显示的地层
const showLayerSelector = ref(false); // 地层选择器显示状态
const perspectiveLayerId = ref(0); // 当前透视的图层ID

// 信息展示
const showLayerInfo = ref(false);
const selectedLayerInfo = ref({});
const selectedLayerId = ref(null);

// 透视模式状态管理
const isPerspectiveMode = ref(false);

// 前四层跳转按钮（此处按"最后四层"为可见与可跳转）
const showJumpBtn = ref(false);
const jumpBtnStyle = ref({ left: "0px", top: "0px" });
let jumpLayerGlobalIndex = -1;
const jumpLayerOrderIndex = ref(-1); // 0..3，按从上到下（20/40/100/250）
let postRenderListener = null;

// 含水层预览按钮
const showPreviewBtn = ref(false);
const previewBtnStyle = ref({ left: "0px", top: "0px" });
const showPreviewModal = ref(false);
const previewImageSrc = ref("");

// 子场景覆盖层
const subsceneVisible = ref(false);
const subsceneKey = ref(""); // 'vp20' | 'vp40' | 'vp100' | 'vp250'

// 跳转按钮文字
const jumpLabelMap = ["vp20", "vp40", "vp100", "vp250"];
const jumpBtnText = computed(() => {
    const key = jumpLabelMap[jumpLayerOrderIndex.value] || "";
    return key ? `进入${key}` : "进入子场景";
});

// ========== 独立地层模型功能 ==========

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
    const url = `/models/aquifer/demo/GeologicalStratification/diceng${index}/0.glb`;
    console.log(`正在加载含水层地层 ${index}: ${url}`);

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
                console.log(`含水层地层 ${i} 加载成功，实体:`, entity);

                // 检查模型状态
                if (entity.model) {
                    console.log(`含水层地层 ${i} 模型状态:`, {
                        ready: entity.model.ready,
                        show: entity.model.show,
                        uri: entity.model.uri,
                    });
                }
            } catch (e) {
                console.error(`加载含水层地层 ${i} 失败:`, e);
            }
        }

        // 聚焦到第一个地层
        if (allLayerEntities.length > 0) {
            viewer.trackedEntity = allLayerEntities[0];
            await viewer.zoomTo(allLayerEntities[0]);
        }

        console.log(`所有含水层地层加载完成，共 ${allLayerEntities.length} 个`);
    } catch (error) {
        console.error("加载所有含水层地层失败:", error);
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

    // 清除tileset（如果存在）
    if (tileset) {
        viewer.scene.primitives.remove(tileset);
        tileset = null;
    }
}

// 展开地层
function expandLayers() {
    if (isExpanded.value || !allLayerEntities.length) return;

    isExpanded.value = true;
    let animationStep = 0;
    const maxSteps = 10;

    const animate = () => {
        if (animationStep >= maxSteps) return;

        allLayerEntities.forEach((entity, index) => {
            if (entity && entity.position) {
                // 计算展开后的位置，每个地层间隔增加到50米
                const expandedHeight = 60 + index * 50;
                const newPosition = Cartesian3.fromDegrees(
                    117.22089726144343,
                    31.833569328835598,
                    expandedHeight
                );

                // 更新位置
                entity.position = newPosition;
            }
        });

        animationStep++;
        if (animationStep < maxSteps) {
            requestAnimationFrame(animate);
        }
    };

    animate();
    console.log("含水层地层展开完成");
}

// 关闭地层
function closeLayers() {
    if (!isExpanded.value || !allLayerEntities.length) return;

    isExpanded.value = false;
    let animationStep = 0;
    const maxSteps = 10;

    const animate = () => {
        if (animationStep >= maxSteps) return;

        allLayerEntities.forEach((entity, index) => {
            if (entity && entity.position) {
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
        });

        animationStep++;
        if (animationStep < maxSteps) {
            requestAnimationFrame(animate);
        }
    };

    animate();
    console.log("含水层地层关闭完成");
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

        // 隐藏跳转和预览按钮
        disableJumpAnchor();

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

        console.log(`含水层地层 ${index} 单独显示成功`);
    } catch (e) {
        console.error(`加载含水层地层 ${index} 失败:`, e);
        alert(`加载含水层地层 ${index} 失败，请检查文件是否存在`);
    } finally {
        isLoading.value = false;
    }
}

// 应用透视效果
function applyPerspective(targetLayerId) {
    if (!allLayerEntities.length) return;

    perspectiveLayerId.value = targetLayerId;

    allLayerEntities.forEach((entity, index) => {
        if (entity && entity.model) {
            if (index === targetLayerId) {
                // 目标地层保持不透明
                entity.model.color = Color.WHITE;
                console.log(`含水层地层 ${index} 设置为不透明`);
            } else {
                // 其他地层设置为半透明
                entity.model.color = Color.WHITE.withAlpha(0.3);
                console.log(`含水层地层 ${index} 设置为半透明`);
            }
        }
    });

    console.log(
        `透视模式：含水层地层 ${targetLayerId} 保持不透明，其他地层半透明`
    );
}

// 清除透视效果
function clearPerspective() {
    allLayerEntities.forEach((entity) => {
        if (entity && entity.model) {
            entity.model.color = Color.WHITE;
        }
    });

    console.log("清除含水层透视效果");
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

        // 如果是最后四层，显示跳转按钮
        if (layerId >= layerNames.length - 4) {
            const orderIdx = layerId - (layerNames.length - 4); // 0,1,2,3
            enableJumpAnchor(layerId, orderIdx);
        } else {
            disableJumpAnchor();
        }

        console.log("选中含水层地层:", layerId);
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
        disableJumpAnchor();

        // 重新加载所有地层
        await loadAllLayers();

        console.log("含水层视图重置完成");
    } catch (error) {
        console.error("重置含水层视图失败:", error);
    }
}

// ========== Tileset 功能（保留，以备切换） ==========

function traverse(node, cb, depth = 0) {
    if (!node) return;
    if (node.children && node.children.length) {
        node.children.forEach((child, i) => {
            cb(child, i, depth);
            traverse(child, cb, depth + 1);
        });
    }
}

function detectTargetDepth() {
    try {
        const r = tileset?.root;
        if (!r) return;
        if (
            r.children &&
            r.children.length === 1 &&
            r.children[0].children &&
            r.children[0].children.length > 0
        ) {
            targetDepth = 2;
        } else {
            targetDepth = 1;
        }
    } catch (_) {}
}

function forEachNodesAtDepth(callback) {
    if (!tileset) return;
    const nodes = [];
    traverse(tileset.root, (child, i, depth) => {
        if (depth === targetDepth) {
            nodes.push(child);
            callback(child, i);
        }
    });
    return nodes;
}

function cacheOriginalTransforms() {
    originalTransforms.clear();
    forEachNodesAtDepth((child) => {
        if (child.transform) {
            originalTransforms.set(
                child,
                Matrix4.clone(child.transform, new Matrix4())
            );
        }
    });
}

function limitLayersVisible(n) {
    const nodes = getDepthNodes();
    const total = nodes.length;
    const start = Math.max(0, total - n);
    nodes.forEach((child, i) => {
        child.show = i >= start;
    });
    if (viewer) viewer.scene.requestRender();
}

function setSpreadInstant(val) {
    if (!tileset || !viewer) return;
    viewer.scene.globe.show = false;
    forEachNodesAtDepth((child, i) => {
        const base = originalTransforms.get(child) || child.transform;
        const mm = Matrix4.clone(base, new Matrix4());
        Matrix4.multiplyByTranslation(mm, { x: 0, y: 0, z: val * i * 1 }, mm);
        child.transform = mm;
    });
    viewer.scene.requestRender();
}

function animateSpread(to) {
    if (!tileset || !viewer) return;
    if (to === currentSpread) return;
    const step = to > currentSpread ? 1 : -1;
    const listener = function () {
        currentSpread += step;
        setSpreadInstant(currentSpread);
        if (
            (step > 0 && currentSpread >= to) ||
            (step < 0 && currentSpread <= to)
        ) {
            viewer.scene.preUpdate.removeEventListener(listener);
        }
    };
    viewer.scene.preUpdate.addEventListener(listener);
}

function getDepthNodes() {
    const nodes = [];
    traverse(tileset?.root, (child, i, depth) => {
        if (depth === targetDepth) {
            nodes.push(child);
        }
    });
    return nodes;
}

function getLastNIndices(n) {
    const nodes = getDepthNodes();
    const total = nodes.length;
    const start = Math.max(0, total - n);
    return Array.from({ length: total - start }, (_, k) => start + k);
}

function getVisibleIndicesSortedTopDown() {
    const nodes = getDepthNodes();
    const lastN = getLastNIndices(VISIBLE_LAYER_COUNT);
    // 按 z 降序（由上到下）
    return lastN
        .map((idx) => ({ idx, z: nodes[idx]?.boundingSphere?.center?.z ?? 0 }))
        .sort((a, b) => b.z - a.z)
        .map((o) => o.idx);
}

function updateJumpButtonPosition() {
    if (!viewer || jumpLayerGlobalIndex < 0) return;
    const nodes = getDepthNodes();
    const node = nodes[jumpLayerGlobalIndex];
    if (!node || !node.boundingSphere) return;
    const win = SceneTransforms.worldToWindowCoordinates(
        viewer.scene,
        node.boundingSphere.center
    );
    if (win && typeof win.x === "number" && typeof win.y === "number") {
        jumpBtnStyle.value = {
            left: `${win.x - 30}px`,
            top: `${win.y - 20}px`,
        };
        // 预览按钮位置在跳转按钮下方
        previewBtnStyle.value = {
            left: `${win.x - 30}px`,
            top: `${win.y + 20}px`,
        };
    }
}

// 为独立地层实体更新跳转按钮位置
function updateJumpButtonPositionForEntity() {
    if (
        !viewer ||
        jumpLayerGlobalIndex < 0 ||
        jumpLayerGlobalIndex >= allLayerEntities.length
    )
        return;

    const entity = allLayerEntities[jumpLayerGlobalIndex];
    if (!entity || !entity.position) return;

    const position = entity.position.getValue(viewer.clock.currentTime);
    if (!position) return;

    const win = SceneTransforms.worldToWindowCoordinates(
        viewer.scene,
        position
    );
    if (win && typeof win.x === "number" && typeof win.y === "number") {
        jumpBtnStyle.value = {
            left: `${win.x - 30}px`,
            top: `${win.y - 20}px`,
        };
        // 预览按钮位置在跳转按钮下方
        previewBtnStyle.value = {
            left: `${win.x - 30}px`,
            top: `${win.y + 20}px`,
        };
    }
}

function enableJumpAnchor(globalIdx, orderIdx = null) {
    if (orderIdx === null) {
        // Tileset 模式：从可见索引中查找
        const sortedTopDown = getVisibleIndicesSortedTopDown();
        orderIdx = sortedTopDown.indexOf(globalIdx); // 0..3
    }

    jumpLayerGlobalIndex = globalIdx;
    jumpLayerOrderIndex.value = orderIdx;
    showJumpBtn.value = orderIdx >= 0;
    // 对所有四层都显示预览按钮
    showPreviewBtn.value = orderIdx >= 0 && orderIdx < 4; // vp20/40/100/250 对应 orderIdx 0/1/2/3

    if (postRenderListener)
        viewer.scene.postRender.removeEventListener(postRenderListener);

    // 在独立地层模式下，直接使用实体的位置
    if (allLayerEntities.length > 0 && globalIdx < allLayerEntities.length) {
        postRenderListener = updateJumpButtonPositionForEntity;
    } else {
        postRenderListener = updateJumpButtonPosition;
    }

    viewer.scene.postRender.addEventListener(postRenderListener);

    // 立即更新位置
    if (allLayerEntities.length > 0 && globalIdx < allLayerEntities.length) {
        updateJumpButtonPositionForEntity();
    } else {
        updateJumpButtonPosition();
    }
}

function disableJumpAnchor() {
    showJumpBtn.value = false;
    showPreviewBtn.value = false;
    jumpLayerGlobalIndex = -1;
    jumpLayerOrderIndex.value = -1;
    if (postRenderListener) {
        viewer.scene.postRender.removeEventListener(postRenderListener);
        postRenderListener = null;
    }
}

function openSubsceneByIndex(orderIdx) {
    // orderIdx: 0..3 => 20/40/100/250
    const mapping = ["vp20", "vp40", "vp100", "vp250"];
    const key = mapping[orderIdx];
    if (!key) return;
    subsceneKey.value = key;
    subsceneVisible.value = true;
    disableJumpAnchor();
    showLayerInfo.value = false;
}

function openCurrentSubscene() {
    openSubsceneByIndex(jumpLayerOrderIndex.value);
}

function closeSubscene() {
    subsceneVisible.value = false;
}

// 预览相关函数
function openPreviewModal() {
    const mapping = ["vp20", "vp40", "vp100", "vp250"];
    const key = mapping[jumpLayerOrderIndex.value];
    if (key) {
        previewImageSrc.value = `/images/aquifer/demo/${key}_preview.png`;
        showPreviewModal.value = true;
    }
}

function closePreviewModal() {
    showPreviewModal.value = false;
}

// ========== 主要功能函数（适配新系统） ==========

// 新的透视模式切换函数
function togglePerspectiveMode() {
    console.log("切换透视模式，当前状态:", isPerspectiveMode.value);

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

// ========== Tileset 兼容函数（保留原有功能） ==========

// 兼容性函数：自动选择合适的展开/关闭方式
function spreadLayers() {
    if (allLayerEntities.length > 0) {
        // 独立地层模式：使用新的展开函数
        expandLayers();
    } else {
        // Tileset 模式：使用原有逻辑
        animateSpread(maxSpread);
    }
}

function closeLayersCompat() {
    if (allLayerEntities.length > 0) {
        // 独立地层模式：使用新的关闭函数
        closeLayers();
    } else {
        // Tileset 模式：使用原有逻辑
        animateSpread(0);
    }
}

function applyPerspectiveMode() {
    if (!tileset) return;

    try {
        // 简单的透视效果：所有地层都设置为半透明
        tileset.style = new Cesium3DTileStyle({
            color: 'color("white", 0.5)',
        });

        // 强制重新渲染
        if (viewer) {
            viewer.scene.requestRender();
        }
    } catch (error) {
        console.error("应用透视模式失败:", error);
    }
}

function resetPerspectiveMode() {
    if (!tileset) return;
    try {
        // 恢复所有地层正常显示
        tileset.style = new Cesium3DTileStyle({
            color: 'color("white", 1.0)',
        });

        // 强制重新渲染
        if (viewer) {
            viewer.scene.requestRender();
        }
    } catch (error) {
        console.error("重置透视模式失败:", error);
    }
    // 可见性限制为前 N 层
    limitLayersVisible(VISIBLE_LAYER_COUNT);
    // 重置矩阵并同步当前展开值
    currentSpread = 0;
    setSpreadInstant(0);
}

// 删除重复的 generateLayerInfo 函数，使用上面定义的版本

onMounted(async () => {
    try {
        window.addEventListener("aquifer-subscene-close", closeSubscene);
        if (!cesiumContainer.value) return;

        // 初始化 Viewer（纯模型场景）
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

        // 默认加载独立地层模型
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
                    console.log("找到含水层地层索引:", layerIndex);
                    handleLayerClick(layerIndex);
                } else {
                    console.log("未找到对应的含水层地层索引");
                }
            } else {
                // 如果没有点击到实体，可能是使用 tileset 模式
                handleTilesetClick(movement);
            }
        }, ScreenSpaceEventType.LEFT_CLICK);
    } catch (error) {
        console.error("初始化含水层场景失败:", error);
    }
});

// Tileset 点击处理（保留兼容性）
function handleTilesetClick(movement) {
    if (!tileset) return;

    const picked = viewer.scene.pick(movement.position);
    if (!picked) return;
    const position = viewer.scene.pickPosition(movement.position);
    if (!position || !tileset.root.children || !tileset.root.children.length)
        return;
    let nearestIdx = 0;
    let minDist = Number.MAX_VALUE;
    const nodes = getDepthNodes();
    for (let i = 0; i < nodes.length; i++) {
        const bs = nodes[i]?.boundingSphere;
        if (!bs) continue;
        const d = Cartesian3.distance(position, bs.center);
        if (d < minDist) {
            minDist = d;
            nearestIdx = i;
        }
    }
    selectedLayerId.value = nearestIdx;
    selectedLayerInfo.value = generateLayerInfo(nearestIdx);
    showLayerInfo.value = true;

    // 如果在透视模式下，更新透视目标
    if (isPerspectiveMode.value) {
        applyPerspectiveMode();
    }

    // 仅对最后四层显示跳转按钮
    const lastN = getLastNIndices(VISIBLE_LAYER_COUNT);
    if (lastN.includes(nearestIdx)) {
        enableJumpAnchor(nearestIdx);
    } else {
        disableJumpAnchor();
    }
}

onBeforeUnmount(() => {
    if (viewer) viewer.destroy();
    window.removeEventListener("aquifer-subscene-close", closeSubscene);
});
</script>

<template>
    <div class="aquifer-viewer-container">
        <div ref="cesiumContainer" class="cesium-container"></div>

        <!-- 左侧工具面板 -->
        <div class="tool-panel">
            <button
                class="tool-btn"
                @click="loadAllLayers"
                :disabled="isLoading"
            >
                {{ allLayerEntities.length > 0 ? "重载地层" : "加载地层" }}
            </button>
            <button
                class="tool-btn"
                @click="expandLayers"
                :disabled="!allLayerEntities.length || isExpanded"
            >
                展开地层
            </button>
            <button
                class="tool-btn"
                @click="closeLayersCompat"
                :disabled="!allLayerEntities.length || !isExpanded"
            >
                关闭地层
            </button>
            <button
                class="tool-btn"
                :class="{ active: isPerspectiveMode }"
                @click="togglePerspectiveMode"
                :disabled="!allLayerEntities.length"
            >
                透视模式
            </button>
            <button
                class="tool-btn"
                @click="toggleLayerSelector"
                :disabled="!allLayerEntities.length"
            >
                选择地层
            </button>
            <button class="tool-btn" @click="resetView">重置视图</button>
        </div>

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

        <!-- 跳转锚点按钮（最后四层） -->
        <button
            v-if="showJumpBtn"
            class="jump-btn"
            :style="jumpBtnStyle"
            @click="openCurrentSubscene"
        >
            {{ jumpBtnText }}
        </button>

        <!-- 含水层预览按钮 -->
        <button
            v-if="showPreviewBtn"
            class="preview-btn"
            :style="previewBtnStyle"
            @click="openPreviewModal"
        >
            含水层预览
        </button>

        <!-- 预览弹窗 -->
        <div
            v-if="showPreviewModal"
            class="preview-modal-overlay"
            @click="closePreviewModal"
        >
            <div class="preview-modal" @click.stop>
                <div class="preview-modal-header">
                    <h3>含水层预览</h3>
                    <button
                        class="preview-close-btn"
                        @click="closePreviewModal"
                    >
                        ×
                    </button>
                </div>
                <div class="preview-modal-content">
                    <img
                        :src="previewImageSrc"
                        alt="含水层预览图"
                        class="preview-image"
                    />
                </div>
            </div>
        </div>

        <!-- 子场景覆盖层 -->
        <div v-if="subsceneVisible" class="subscene-overlay">
            <div class="subscene-container">
                <component
                    :is="
                        subsceneKey === 'vp20'
                            ? Vp20
                            : subsceneKey === 'vp40'
                            ? Vp40
                            : subsceneKey === 'vp100'
                            ? Vp100
                            : Vp250
                    "
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.aquifer-viewer-container {
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
    background: #000;
    z-index: 1;
}

/* 左侧竖排工具按钮（替换原先初始化/定位区域） */
.tool-panel {
    position: absolute;
    left: 240px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 20;
}
.tool-btn {
    min-width: 110px;
    height: 34px;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 8px;
    border: 1px solid #17c7fe;
    background: #101d29;
    color: #17c7fe;
    cursor: pointer;
    transition: all 0.2s;
}
.tool-btn:hover:not(:disabled) {
    background: #17c7fe;
    color: #101d29;
}
.tool-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.tool-btn.active {
    background: #17c7fe;
    color: #101d29;
    box-shadow: 0 0 10px rgba(23, 199, 254, 0.5);
}

/* 地层选择器面板样式 */
.layer-selector-panel {
    position: absolute;
    top: 32px;
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

.layer-select-btn:hover:not(:disabled) {
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
    top: 32px;
    right: 32px;
    background: rgba(16, 29, 41, 0.92);
    border-radius: 14px;
    padding: 20px 18px 16px 18px;
    width: 260px;
    box-shadow: 0 4px 24px 0 rgba(23, 199, 254, 0.18),
        0 1.5px 8px 0 rgba(0, 0, 0, 0.25);
    border: 1.5px solid #17c7fe;
    z-index: 3;
}
.layer-info-panel h3 {
    margin: 0 0 12px 0;
    color: #17c7fe;
    font-size: 18px;
    font-weight: 700;
}
.layer-info-panel table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}
.layer-info-panel th,
.layer-info-panel td {
    padding: 8px 6px;
    text-align: left;
    border-bottom: 1px solid #22384a;
    font-size: 14px;
    color: #eaf6ff;
}
.layer-info-panel th {
    background: #112233;
    color: #17c7fe;
    font-weight: 700;
    border-bottom: 2px solid #17c7fe;
}
.close-btn {
    position: absolute;
    top: 8px;
    right: 10px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #17c7fe;
}

/* 跳转锚点按钮 */
.jump-btn {
    position: absolute;
    transform: translate(-50%, -50%);
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 6px;
    border: 1px solid #17c7fe;
    background: rgba(16, 29, 41, 0.95);
    color: #17c7fe;
    z-index: 25;
    cursor: pointer;
}
.jump-btn:hover {
    background: #17c7fe;
    color: #101d29;
}

/* 含水层预览按钮 */
.preview-btn {
    position: absolute;
    transform: translate(-50%, -50%);
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 6px;
    border: 1px solid #17c7fe;
    background: rgba(16, 29, 41, 0.95);
    color: #17c7fe;
    z-index: 25;
    cursor: pointer;
}
.preview-btn:hover {
    background: #17c7fe;
    color: #101d29;
}

/* 预览弹窗 */
.preview-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 40;
}
.preview-modal {
    background: #101d29;
    border-radius: 14px;
    padding: 20px;
    width: 80%;
    max-width: 600px;
    box-shadow: 0 4px 24px 0 rgba(23, 199, 254, 0.18),
        0 1.5px 8px 0 rgba(0, 0, 0, 0.25);
    border: 1.5px solid #17c7fe;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.preview-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #22384a;
}
.preview-modal-header h3 {
    margin: 0;
    color: #17c7fe;
    font-size: 18px;
    font-weight: 700;
}
.preview-close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #17c7fe;
}
.preview-modal-content {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.preview-image {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 8px;
    box-shadow: 0 4px 24px 0 rgba(23, 199, 254, 0.18),
        0 1.5px 8px 0 rgba(0, 0, 0, 0.25);
}

/* 子场景覆盖层 */
.subscene-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
}
.subscene-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: #000;
}
</style>
