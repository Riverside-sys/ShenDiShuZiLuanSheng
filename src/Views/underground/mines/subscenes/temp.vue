<template>
    <div id="cesiumContainer">
        <div class="button-container">
            <button @click="spreadLayers">展开地层</button>
            <button @click="closeLayers">关闭地层</button>
            <button @click="showSingleLayer">模型透视</button>
            <button @click="resetLayers">重置显示所有地层</button>
            <!-- 添加单独显示地层的按钮 -->
            <button @click="toggleLayerSelector">选择地层</button>
        </div>

        <!-- 添加地层选择器 -->
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
                    class="layer-btn"
                >
                    {{ layerName }} ({{ index }})
                </button>
            </div>
        </div>

        <!-- 添加地层信息表格 -->
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

<script setup>
import { onMounted, ref } from "vue";

Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYWY1MDY0ZC1hOWNjLTQzY2QtODZlYy0wOGY1MGI2NTA0OTAiLCJpZCI6MzAzNDgzLCJpYXQiOjE3NDc1NjExNTJ9.qvdGNTNDD4XEnC4LFeRXsQAIhB4SdDnxlIodHcvQ69k";

let tileset;
let viewer;
// 添加地层信息显示控制变量
const showLayerInfo = ref(false);
// 选中的地层信息c
const selectedLayerInfo = ref({});
// 当前选中的地层ID
const selectedLayerId = ref(null);

// 添加新的响应式变量
const showLayerSelector = ref(false);
const selectedSingleLayer = ref(null);
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

// 单独显示某一地层
const isLoading = ref(false);
let currentEntity = null;

// 展开地层方法
const spreadLayers = () => {
    // 隐藏地球
    viewer.scene.globe.show = false;

    // 获取地层数量
    const dcCount = tileset.root.children[0].children.length;
    let num = 0;

    // 创建监听器函数
    const listener = function (scene, time) {
        num += 1;

        // 遍历所有地层
        for (let i = 0; i < dcCount; ++i) {
            // 获取当前地层的变换矩阵
            const mm = tileset.root.children[0].children[i].transform;

            // 计算地层相对于中心点的位置
            const tempCartesian = new Cesium.Cartesian3();
            Cesium.Cartesian3.subtract(
                tileset.root.children[0].children[i].boundingSphere.center,
                tileset.boundingSphere.center,
                tempCartesian
            );

            // 计算地层高度
            const tempHeight = tempCartesian.z;
            let tempNum = 0;

            // 根据高度确定方向
            if (tempHeight > 0) {
                tempNum = 1;
            } else if (tempHeight < 0) {
                tempNum = -1;
            } else {
                tempNum = 0;
            }

            // 计算地层偏移量
            const temp = { x: 0, y: 0, z: num * i };

            // 应用偏移变换
            Cesium.Matrix4.multiplyByTranslation(mm, temp, mm);
            tileset.root.children[0].children[i].transform = mm;
        }

        // 达到指定次数后移除监听器
        if (num >= 5) {
            viewer.scene.preUpdate.removeEventListener(listener);
        }
    };

    // 添加场景更新前的监听器
    viewer.scene.preUpdate.addEventListener(listener);
};

// 关闭地层方法
const closeLayers = () => {
    // 显示地球
    // viewer.scene.globe.show = true;

    // 获取地层数量
    const dcCount = tileset.root.children[0].children.length;
    let num = 0;

    // 创建监听器函数
    const listener = function (scene, time) {
        num -= 1;

        // 遍历所有地层
        for (let i = 0; i < dcCount; ++i) {
            // 获取当前地层的变换矩阵
            const mm = tileset.root.children[0].children[i].transform;

            // 计算地层相对于中心点的位置
            const tempCartesian = new Cesium.Cartesian3();
            Cesium.Cartesian3.subtract(
                tileset.root.children[0].children[i].boundingSphere.center,
                tileset.boundingSphere.center,
                tempCartesian
            );

            // 计算地层高度
            const tempHeight = tempCartesian.z;
            let tempNum = 0;

            // 根据高度确定方向
            if (tempHeight > 0) {
                tempNum = 1;
            } else if (tempHeight < 0) {
                tempNum = -1;
            } else {
                tempNum = 0;
            }

            // 计算地层偏移量
            const temp = { x: 0, y: 0, z: num * i };

            // 应用偏移变换
            Cesium.Matrix4.multiplyByTranslation(mm, temp, mm);
            tileset.root.children[0].children[i].transform = mm;
        }

        // 达到指定次数后移除监听器
        if (Math.abs(num) >= 5) {
            viewer.scene.preUpdate.removeEventListener(listener);
        }
    };

    // 添加场景更新前的监听器
    viewer.scene.preUpdate.addEventListener(listener);
};

// 生成随机的地层信息
const generateLayerInfo = (layerId) => {
    const layerTypes = ["砂岩", "页岩", "石灰岩", "煤层", "粉砂岩", "泥岩"];
    const randomType =
        layerTypes[Math.floor(Math.random() * layerTypes.length)];

    // 根据layerId获取地层名称
    let layerName = "未知地层";
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
};

// 模型透视显示
const showSingleLayer = () => {
    // 使用tileset.style来控制显示
    try {
        // 根据索引创建条件表达式
        tileset.style = new Cesium.Cesium3DTileStyle({
            color: {
                conditions: [
                    [
                        `\${id} === 'diceng${selectedLayerId.value + 1}'`,
                        'color("white", 1.0)',
                    ],
                    ["true", 'color("white", 0.5)'],
                ],
            },
        });
        console.log("应用样式成功，显示地层:", selectedLayerId.value + 1);
    } catch (error) {
        console.error("设置tileset样式失败:", error);
    }
};

// 重置显示所有地层
const resetLayers = async () => {
    try {
        if (currentEntity) {
            viewer.entities.remove(currentEntity);
            currentEntity = null;
        }
        viewer.trackedEntity = undefined;
        // 判断是否为单层模式（tileset被隐藏）
        if (tileset && !tileset.show) {
            // 单层模式，重新加载3dtiles
            await loadTileset();
            if (tileset) tileset.show = true;
            selectedSingleLayer.value = null;
            console.log("重新加载3dtiles，显示所有地层");
        } else {
            // 透明模式或正常模式，恢复样式
            if (tileset) tileset.show = true;
            selectedSingleLayer.value = null;
            tileset.style = new Cesium.Cesium3DTileStyle({
                color: 'color("white", 1.0)',
            });
            console.log("重置样式成功，显示所有地层");
        }
    } catch (error) {
        console.error("重置tileset样式失败:", error);
    }
};

// 切换地层选择器显示
const toggleLayerSelector = () => {
    showLayerSelector.value = !showLayerSelector.value;
};

// 单独显示某一个地层
const showOnlyLayer = async (index) => {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
        selectedSingleLayer.value = index;

        // 隐藏整体 tileset，进入“单层模式”
        if (tileset) tileset.show = false;

        // 删除已加载的单层实体
        if (currentEntity) {
            viewer.entities.remove(currentEntity);
            currentEntity = null;
        }

        const url = `/dandudiceng/diceng${index}/0.glb`;
        console.log(`正在加载地层 ${index}: ${url}`);

        const position = Cesium.Cartesian3.fromDegrees(
            117.22089726144343,
            31.833569328835598,
            60
        );
        const heading = Cesium.Math.toRadians(0);
        const pitch = Cesium.Math.toRadians(-90);
        const roll = Cesium.Math.toRadians(90);
        const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(
            position,
            hpr
        );

        currentEntity = await viewer.entities.add({
            position,
            orientation,
            model: {
                uri: url,
                minimumPixelSize: 128,
                maximumScale: 800,
            },
        });

        viewer.trackedEntity = currentEntity;
        await viewer.zoomTo(currentEntity);

        console.log(`地层 ${index} 加载成功`);
    } catch (e) {
        console.error(`加载地层 ${index} 失败:`, e);
        alert(`加载地层 ${index} 失败，请检查文件是否存在`);
    } finally {
        isLoading.value = false;
    }
};

// 封装加载3dtiles的函数
const loadTileset = async () => {
    try {
        // 若已存在tileset，先移除
        if (tileset) {
            viewer.scene.primitives.remove(tileset);
            tileset = null;
        }
        tileset = await Cesium.Cesium3DTileset.fromUrl("/diceng/tileset.json", {
            modelMatrix: Cesium.Matrix4.fromArray([
                0.9968103011141229, -0.06607658011747744, 0.04475610743518041,
                0, 0.06990471351651151, 0.9934677396759846,
                -0.09019523962640563, 0, -0.038503955912934706,
                0.09303620683942887, 0.9949179411368485, 0,
            ]),
            luminanceAtZenith: 1,
            lightColor: new Cesium.Cartesian3(0.8, 0.8, 0.8),
            maximumMemoryUsage: 32,
            maximumScreenSpaceError: 2,
        });
        viewer.scene.primitives.add(tileset);
        viewer.zoomTo(tileset);
        // 重新绑定点击事件
        viewer.screenSpaceEventHandler.setInputAction((movement) => {
            const pickedFeature = viewer.scene.pick(movement.position);
            if (Cesium.defined(pickedFeature)) {
                const position = viewer.scene.pickPosition(movement.position);
                if (position) {
                    let nearestLayerIndex = -1;
                    let minDistance = Number.MAX_VALUE;
                    const dcCount = tileset.root.children[0].children.length;
                    for (let i = 0; i < dcCount; ++i) {
                        if (
                            tileset.root.children[0].children[i].boundingSphere
                        ) {
                            const distance = Cesium.Cartesian3.distance(
                                position,
                                tileset.root.children[0].children[i]
                                    .boundingSphere.center
                            );
                            if (distance < minDistance) {
                                minDistance = distance;
                                nearestLayerIndex = i;
                            }
                        }
                    }
                    if (nearestLayerIndex >= 0) {
                        selectedLayerId.value = nearestLayerIndex;
                        selectedLayerInfo.value =
                            generateLayerInfo(nearestLayerIndex);
                        showLayerInfo.value = true;
                        console.log("选中地层:", nearestLayerIndex);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // 恢复样式
        tileset.style = new Cesium.Cesium3DTileStyle({
            color: 'color("white", 1.0)',
        });
    } catch (error) {
        console.error(`Error creating tileset: ${error}`);
    }
};

onMounted(async () => {
    viewer = new Cesium.Viewer("cesiumContainer");
    // 隐藏logo信息
    viewer._cesiumWidget._creditContainer.style.display = "none";
    // 隐藏地球
    viewer.scene.globe.show = false;
    // 开启地形检测
    viewer.scene.globe.depthTestAgainstTerrain = true;
    // 解决iframe跨域问题
    var iframe = document.getElementsByClassName("cesium-infoBox-iframe")[0];
    iframe.setAttribute(
        "sandbox",
        "allow-same-origin allow-scripts allow-popups allow-forms"
    );
    iframe.setAttribute("src", "");
    // 加载3dtiles
    await loadTileset();
});
</script>

<style>
.button-container {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
}

.button-container button {
    margin-right: 10px;
    padding: 8px 16px;
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
}

.button-container button:hover {
    background-color: rgba(255, 255, 255, 1);
}

.layer-info-panel {
    position: absolute;
    top: 60px;
    right: 20px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    padding: 15px;
    width: 300px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.layer-info-panel h3 {
    margin-top: 0;
    margin-bottom: 15px;
}

.layer-info-panel table {
    width: 100%;
    border-collapse: collapse;
}

.layer-info-panel th,
.layer-info-panel td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.layer-info-panel th {
    background-color: #f2f2f2;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #666;
}

.layer-info-panel button {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.layer-info-panel button:hover {
    background-color: #45a049;
}

.layer-selector-panel {
    position: absolute;
    top: 60px;
    left: 20px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    padding: 15px;
    width: 250px;
    max-height: 400px;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.layer-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.layer-btn {
    padding: 8px 12px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s;
}

.layer-btn:hover {
    background-color: #e0e0e0;
}

.layer-btn.active {
    background-color: #4caf50;
    color: white;
}
</style>
