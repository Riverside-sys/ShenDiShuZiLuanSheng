<!-- 矿井场景的总组件（入口）  -->
<template>
    <div class="mine-scene-container">
        <!-- 左侧：图标信息面板 -->

        <!-- Cesium 3D 场景容器：矿井主场景 -->
        <div v-if="!showMeshViewer" id="cesiumContainer" style="
                position: absolute;
                top: 0px;
                left: 0px;
                height: 100%;
                width: 100%;
            "></div>

        <!-- MeshViewer 容器：子场景容器 -->
        <div v-if="showMeshViewer" style="
                position: absolute;
                top: 0px;
                left: 0px;
                height: 100%;
                width: 100%;
                pointer-events: none;
            ">
            <!-- 变电站子场景 -->
            <SubstationViewer v-if="currentViewer === 'substation'" />
            <!-- 填充回采工作面子场景 -->
            <BackfillMiningFace v-if="currentViewer === 'backfill-mining-face'" />
            <!-- 避难硐室子场景 -->
            <EmergencyRefugeChamber v-if="currentViewer === 'emergency-refuge-chamber'" />
            <!-- 消防器材库子场景 -->
            <FireEquipmentStorage v-if="currentViewer === 'fire-equipment-storage'" />
            <!-- 综放工作面子场景 -->
            <FullyMechanizedFace v-if="currentViewer === 'fully-mechanized-face'" />
            <!-- 地质分层子场景 -->
            <GeologicalStratification v-if="currentViewer === 'geological-stratification'" />
            <!-- 高斯泼溅巷道子场景 -->
            <MinesRoadwayGsplat v-if="currentViewer === 'mines-roadway-gsplat'" />
            <!-- 潘一东矿区子场景 -->
            <!-- <PanYiDongMine v-if="currentViewer === 'panyidong-mine'" /> -->
            <!-- 返回按钮 -->
            <!-- <div class="back-button" @click="goBackToCesium">
                <span>← 返回</span>
            </div> -->
        </div>

        <!-- 左侧：功能按钮（矿井） -->
        <div v-if="!showMeshViewer" :class="routeUrl == true ? 'btnbox1' : 'btnbox'">
            <!-- 初始化 -->
            <a-tooltip placement="left">
                <div class="btnoneBox bg1" @click="init"></div>
                <div class="btnText">初始化</div>
            </a-tooltip>
            <!-- 定位 -->
            <a-tooltip placement="left">
                <div class="btnoneBox bg2" @click="dytoggleShow"></div>
                <div class="btnText">定位</div>
            </a-tooltip>
            <!-- 定位功能扩展选项 -->
            <div class="fourlayer1" v-if="dyisVisible == true">
                <div :class="dyActive1 == item.id ? 'fourbtns' : 'fourbtn'"
                    v-for="(item, index) in dyArr" :key="index" @click="dychange(item)">
                    {{ item.name }}
                </div>
            </div>
            <!-- 煤层 -->
            <a-tooltip placement="left">
                <div class="btnoneBox bg3" @click="toggleShow"></div>
                <div class="btnText">煤层</div>
            </a-tooltip>
            <!-- 煤层功能扩展选项 -->
            <div class="fourlayer" v-if="isVisible == true">
                <div :class="btnActive1 == item.id ? 'fourbtns' : 'fourbtn'"
                    @click="btnchange(item)" v-for="(item, index) in btnArr" :key="index">
                    {{ item.name }}
                </div>
            </div>
            <!-- 图表 -->
            <a-tooltip placement="left">
                <div class="btnoneBox bg4" @click="togglePanelShow"></div>
                <div class="btnText">图表</div>
            </a-tooltip>
            <!-- 图表功能扩展选项 -->
            <div class="fourlayer" v-if="showSelector">
                <div v-for="item in panelArr" :key="item.id"
                    :class="panelActive === item.id ? 'fourbtns' : 'fourbtn'"
                    @click="panelChange(item)">
                    {{ item.name }}
                </div>
            </div>
            <!-- 全屏 -->
            <a-tooltip placement="left">
                <div class="btnoneBox bg5" @click="toggleFullScreen"></div>
                <div class="btnText">全屏</div>
            </a-tooltip>
        </div>

        <!-- 右侧：图表信息面板 -->
        <right_box v-if="panelVisible && !showMeshViewer">
            <div v-if="panelActive === 1">
                <!-- 总览 -->
                <OverviewPanel />
            </div>
            <div v-if="panelActive === 2">
                <!-- 实景 -->
                <LivePanel />
            </div>
            <div v-if="panelActive === 3">
                <!-- 井下 -->
                <BelowPanel />
            </div>
        </right_box>
    </div>
</template>

<script setup>
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
// 三维场景标签坐标数据
import * as tagwork from "@/utils/mines_platform/mapData/tag.js";
// cesium三维场景底层控制器
import * as mapwork from "@/utils/mines_platform/cesium/demo1.js";
import { toRaw, ref, watch, onMounted, nextTick, onUnmounted } from "vue";
import { pointStore } from "@/stores/modules/point.js";
import { useRoute, useRouter } from "vue-router";
// 导入图表组件
import OverviewPanel from "@/components/overview/overviewPanel/index.vue";
import LivePanel from "@/components/overview/livePanel/index.vue";
import BelowPanel from "@/components/overview/belowPanel/index.vue";
import right_box from "@/components/right_box.vue";
// 导入子场景组件
import SubstationViewer from "@/Views/underground/mines/subscenes/SubstationViewer.vue";
import BackfillMiningFace from "@/Views/underground/mines/subscenes/BackfillMiningFace.vue";
import EmergencyRefugeChamber from "@/Views/underground/mines/subscenes/EmergencyRefugeChamber.vue";
import FireEquipmentStorage from "@/Views/underground/mines/subscenes/FireEquipmentStorage.vue";
import FullyMechanizedFace from "@/Views/underground/mines/subscenes/FullyMechanizedFace.vue";
import GeologicalStratification from "@/Views/underground/mines/subscenes/GeologicalStratification.vue";
import MinesRoadwayGsplat from "@/Views/underground/mines/subscenes/MinesRoadwayGsplat.vue";
// import PanYiDongMine from "@/Views/underground/mines/subscenes/panyidong/PanYiDongMine.vue";
// import { PersonnelPositioningApi } from '@/api/PersonnelPositioning.js'

const pointStores = pointStore();
const route = useRoute();
const router = useRouter();
const routeUrl = ref(false);
if (
    route.path == "/integrated-disaster-prevention/hidden-danger-management" ||
    route.path == "/integrated-disaster-prevention/risk-assessment"
) {
    nextTick(() => {
        routeUrl.value = true;
    });
}

// cesium场景初始化与事件监听
onMounted(() => {
    mapwork.init("cesiumContainer");

    // 监听容器切换事件：主场景 -> 子场景
    window.addEventListener("switchToMeshViewer", (event) => {
        showMeshViewer.value = true;
        // 根据事件详情确定显示哪个查看器
        if (event.detail && event.detail.item) {
            if (event.detail.item.name === "填充回采工作面") {
                currentViewer.value = "backfill-mining-face";
            } else if (event.detail.item.name === "避难硐室") {
                currentViewer.value = "emergency-refuge-chamber";
            } else if (event.detail.item.name === "消防器材库") {
                currentViewer.value = "fire-equipment-storage";
            } else if (event.detail.item.name === "3106综放工作面") {
                currentViewer.value = "fully-mechanized-face";
            } else if (event.detail.item.name === "地层") {
                currentViewer.value = "geological-stratification";
            } else {
                currentViewer.value = "substation";
            }
        }
    });

    // 监听子场景返回事件：子场景 -> 主场景
    window.addEventListener("mine-subscene-close", () => {
        showMeshViewer.value = false;
        // 重新初始化Cesium场景以恢复显示
        nextTick(() => {
            mapwork.init("cesiumContainer");
        });
    });
});

// 卸载事件监听
onUnmounted(() => {
    // 移除事件监听
    window.removeEventListener("switchToMeshViewer", () => { });
    window.removeEventListener("mine-subscene-close", () => { });
});

//  全屏
const isFullScreen = ref(false);
const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        // 进入全屏
        document.documentElement.requestFullscreen();
        isFullScreen.value = true;
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        isFullScreen.value = false;
    }
};
document.addEventListener("toggleFullScreen", () => {
    isFullScreen.value = !!document.fullscreenElement;
});

// 左侧功能按钮扩展选项
const dyisVisible = ref(false); // 定位功能扩展是否显示
const isVisible = ref(false);  // 煤层功能扩展是否显示
const showSelector = ref(false); // 图表功能扩展选项是否显示
const typeVisible = ref(false);  // <多余>

// 右侧图表信息面板是否显示
const panelVisible = ref(true);

// 子场景是否显示
const showMeshViewer = ref(false);

// 当前显示的查看器类型
const currentViewer = ref("substation");

// 左侧功能按钮：定位点击事件
function dytoggleShow() {
    dyisVisible.value = !dyisVisible.value;
    isVisible.value = false;
    typeVisible.value = false;
    showSelector.value = false;
}
// 左侧功能按钮：煤层点击事件
function toggleShow() {
    isVisible.value = !isVisible.value;
    dyisVisible.value = false;
    typeVisible.value = false;
    showSelector.value = false;
}
// 左侧功能按钮：图表点击事件
function togglePanelShow() {
    showSelector.value = !showSelector.value;
    dyisVisible.value = false;
    typeVisible.value = false;
    isVisible.value = false;
}
// <多余>
function cadTypetoggleShow() {
    typeVisible.value = !typeVisible.value;
    dyisVisible.value = false;
    isVisible.value = false;
    showSelector.value = false;
}

// 定位功能扩展选项
const dyActive1 = ref("");
const dyArr = ref([
    { id: 1, name: "副立井", position: [112.9656015, 36.0641038, 658.0818095] },
    { id: 2, name: "风井", position: [112.9656061, 36.0641074, 657.9551153] },
    { id: 3, name: "主斜井", position: [112.9672458, 36.0661303, 662.9683819] },
]);
const dychange = (e) => {
    dyActive1.value = e.id;
    if (e) {
        mapwork.clear();
        mapwork.flyTo1(e.position, 0, 0, 0, 3);
        mapwork.placeDiv(
            new Cesium.Color(0.737, 0.361, 0.047, 1.0),
            "/config/wellhead.png",
            [e]
        );
    }
};

// 煤层功能扩展选项
const btnActive1 = ref(false);
const btnArr = ref([
    { id: 1, name: "全矿" },
    { id: 2, name: "巷道标签" },
    { id: 3, name: "地层" }, // 新增地层选项
    { id: 4, name: "高斯泼溅" }, // 新增高斯泼溅选项
    // { id: 5, name: "潘一东矿区" } // 新增潘一东矿区选项
]);
const btnchange = (e) => {
    btnActive1.value = e.id;
    if (e.id == 1) {
        mapwork.clear();
        // mapwork.flyTo([113.184814, 36.834156, 4911.4], 146.4, -58.8, 369, 2)
    }
    if (e.id == 2) {
        mapwork.placeDiv(
            new Cesium.Color(0.737, 0.361, 0.047, 1.0),
            "/config/wellhead.png",
            tagwork.wellhead
        );
        // 消防器材库
        mapwork.placeDiv(
            new Cesium.Color(0.655, 0.137, 0.039, 1.0),
            "/config/Material.png",
            tagwork.Material
        );
        // 硐室
        mapwork.placeDiv(
            new Cesium.Color(0.2, 0.416, 0.125, 1.0),
            "/config/cave.png",
            tagwork.cave
        );
        // 水泵房
        mapwork.placeDiv(
            new Cesium.Color(0.024, 0.502, 0.714, 1.0),
            "/config/WaterRoom.png",
            tagwork.WaterRoom
        );
        // 变电所
        mapwork.placeDiv(
            new Cesium.Color(0.556, 0.42, 0.039, 1.0),
            "/config/substation.png",
            tagwork.substation
        );
        // 工作面
        mapwork.placeDiv(
            new Cesium.Color(0.294, 0.314, 0.482, 1.0),
            "/config/face.png",
            tagwork.face
        );
        // 煤仓
        mapwork.placeDiv(
            new Cesium.Color(0.596, 0.133, 0.792, 1.0),
            "/config/coal.png",
            tagwork.coal
        );
        // 水泵房
        mapwork.placeDiv(
            new Cesium.Color(0.556, 0.42, 0.039, 1.0),
            "/config/WaterRoom.png",
            tagwork.WaterRoom2
        );
    }
    if (e.id == 3) {
        // 地层，切换到地层场景组件
        showMeshViewer.value = true;
        currentViewer.value = "geological-stratification";
    }
    if (e.id == 4) {
        // 高斯泼溅，跳转到独立路由
        // console.log("🎯 煤层按钮 - 高斯泼溅被点击，正在跳转到路由");
        // console.log(
        //     "🔗 目标路由: /underground/mines/subscenes/mines_roadway_gsplat"
        // );
        // router.push("/underground/mines/subscenes/mines_roadway_gsplat");

        showMeshViewer.value = true;
        currentViewer.value = "mines-roadway-gsplat";
    }
    // if (e.id == 5) {
    //     console.log("🎯 煤层按钮 - 潘一东矿区被点击，正在跳转到路由");
    //     showMeshViewer.value = true;
    //     currentViewer.value = "panyidong-mine";
    // }
};

// 图表功能扩展选项
const panelActive = ref(1);
const panelArr = ref([
    { id: 1, name: "总览" },
    { id: 2, name: "实景" },
    { id: 3, name: "井下" },
]);
const panelChange = (e) => {
    panelActive.value = e.id;
};

// <多余>
const typeActive1 = ref();
const typeArr = ref([{ id: 1, name: "3D" }]);
const cadTypechange = (e) => {
    typeActive1.value = e.id;
    mapwork.clear();
    if (e.id == 1) {
        mapwork.viewer.scene.primitives.add(mapwork.tileset);
    }
    if (e.id == 2) {
        mapwork.viewer.scene.primitives.add(mapwork.tileset1);
    }
};

// 左侧功能按钮：初始化点击事件
const init = () => {
    nextTick(() => {
        console.log(mapwork);
        console.log("1");
        console.log(pointStores);
        console.log("1floodDiv");
        console.log(mapwork.fireDiv);
        mapwork.clear();
    });
};

/* 下面几个watch是用于监听pointStores中的数据变化，并更新cesium场景 */
//  sensordiv
watch(
    () => pointStores.sensor,
    (newVal) => {
        if (newVal) {
            mapwork.clear();
            var newdata = toRaw(newVal);
            mapwork.flyTo1(
                [newdata.latitude, newdata.longitude, newdata.altitude],
                0,
                0,
                0,
                3
            );
            mapwork.sersorDiv([
                {
                    name:
                        newdata.title ||
                        newdata.name ||
                        newdata.observationName,
                    position: [
                        newdata.latitude,
                        newdata.longitude,
                        newdata.altitude,
                    ],
                    data: newdata,
                },
            ]);
        }
    }
);
// newbase
watch(
    () => pointStores.newbase,
    (newVal) => {
        if (newVal) {
            mapwork.clear();
            var newdata = toRaw(newVal);
            mapwork.flyTo1(
                [
                    newdata.latitude || newdata.xcoordinate,
                    newdata.longitude || newdata.ycoordinate,
                    newdata.altitude || newdata.zcoordinate,
                ],
                0,
                0,
                0,
                3
            );
            mapwork.baseDiv([
                {
                    name: newdata.psStationName || newdata.name,
                    position: [
                        newdata.latitude || newdata.xcoordinate,
                        newdata.longitude || newdata.ycoordinate,
                        newdata.altitude || newdata.zcoordinate,
                    ],
                    data: newdata,
                },
            ]);
        }
    }
);

//  newpeople
// watch(
//   () => pointStores.newpeople,
//   (newVal) => {
//     if (newVal) {
//       mapwork.clear();
//       var newdata = toRaw(newVal.dataRef)
//       // console.log("newdata", newdata)
//       mapwork.flyTo1([newdata.latitude, newdata.longitude, newdata.altitude], 0, 0, 0, 3)
//       mapwork.peopleDiv([{ name: newdata.title ? newdata.title : '/', position: [newdata.latitude, newdata.longitude, newdata.altitude] ,data:newVal}])
//     }
//   }
// )

watch(
    () => pointStores.newpeople,
    (newVal) => {
        if (newVal) {
            mapwork.clear();
            var newdata = toRaw(newVal);
            console.log("newdata", newdata);
            mapwork.flyTo1(
                [newdata.latitude, newdata.longitude, newdata.altitude],
                0,
                0,
                0,
                3
            );
            mapwork.peopleDiv([
                {
                    name: newdata.title || newdata.name || newdata.psPersonName,
                    position: [
                        newdata.latitude,
                        newdata.longitude,
                        newdata.altitude,
                    ],
                    data: newVal,
                    // data2: phones.value
                },
            ]);
        }
    }
);

//  videodiv
watch(
    () => pointStores.newvideo,
    (newVal) => {
        if (newVal) {
            mapwork.clear();
            var newdata = toRaw(newVal);
            mapwork.flyTo1(
                [newdata.longitude, newdata.latitude, newdata.altitude],
                0,
                0,
                0,
                3
            );
            mapwork.videoDiv([
                {
                    name: newdata.emergencyWebcamName || newdata.monitorName,
                    position: [
                        newdata.longitude,
                        newdata.latitude,
                        newdata.altitude,
                    ],
                    data: newdata,
                },
            ]);
        }
    }
);
// minePressurediv
watch(
    () => pointStores.newminePressure,
    (newVal) => {
        if (newVal) {
            mapwork.clear();
            var newdata = toRaw(newVal);

            mapwork.flyTo1(
                [newdata.latitude, newdata.longitude, newdata.altitude],
                0,
                0,
                0,
                3
            );
            mapwork.minePressureDiv([
                {
                    name: newdata.title ? newdata.title : "/",
                    position: [
                        newdata.latitude,
                        newdata.longitude,
                        newdata.altitude,
                    ],
                    data: newdata,
                },
            ]);
        }
    }
);
// newfire
watch(
    () => pointStores.newfire,
    (newVal) => {
        if (newVal) {
            mapwork.clear();
            var newdata = toRaw(newVal);

            mapwork.flyTo1(
                [newdata.latitude, newdata.longitude, newdata.altitude],
                0,
                0,
                0,
                3
            );
            mapwork.fireDiv([
                {
                    name: newdata.title ? newdata.title : "/",
                    position: [
                        newdata.latitude,
                        newdata.longitude,
                        newdata.altitude,
                    ],
                    data: newdata,
                },
            ]);
        }
    }
);
// newflood
watch(
    () => pointStores.newflood,
    (newVal) => {
        if (newVal) {
            mapwork.clear();
            var newdata = toRaw(newVal);
            mapwork.flyTo1(
                [newdata.latitude, newdata.longitude, newdata.altitude],
                0,
                0,
                0,
                3
            );
            mapwork.floodDiv([
                {
                    name: newdata.title ? newdata.title : "/",
                    position: [
                        newdata.latitude,
                        newdata.longitude,
                        newdata.altitude,
                    ],
                    data: newdata,
                },
            ]);
        }
    }
);
// 电话
watch(
    () => pointStores.phone,
    (newVal) => {
        if (newVal) {
            mapwork.clear();
            var newdata = toRaw(newVal);
            mapwork.flyTo1(
                [newdata.latitude, newdata.longitude, newdata.altitude],
                0,
                0,
                0,
                3
            );
            mapwork.phoneDiv([
                {
                    name: newdata.title ? newdata.title : "/",
                    position: [
                        newdata.latitude,
                        newdata.longitude,
                        newdata.altitude,
                    ],
                },
            ]);
        }
    }
);
// 广播  broadcast
watch(
    () => pointStores.broadcast,
    (newVal) => {
        if (newVal) {
            console.log(mapwork);
            console.log("2");
            mapwork.clear();
            var newdata = toRaw(newVal);
            console.log("newdata", newdata);
            mapwork.flyTo1(
                [newdata.latitude, newdata.longitude, newdata.altitude],
                0,
                0,
                0,
                3
            );
            mapwork.radioDiv([
                {
                    name: newdata.title || newdata.fullname,
                    position: [
                        newdata.latitude,
                        newdata.longitude,
                        newdata.altitude,
                    ],
                },
            ]);
        }
    }
);
// 设备
watch(
    () => pointStores.base,
    (newVal) => {
        if (newVal) {
            mapwork.clear();
            var newdata = toRaw(newVal);
            mapwork.flyTo1(
                [newdata.latitude, newdata.longitude, newdata.altitude],
                0,
                0,
                0,
                3
            );
            mapwork.deviceDiv([
                {
                    name: newdata.title,
                    position: [
                        newdata.latitude,
                        newdata.longitude,
                        newdata.altitude,
                    ],
                },
            ]);
        }
    }
);

// 返回Cesium场景
const goBackToCesium = () => {
    console.log("返回按钮被点击");
    showMeshViewer.value = false;
    console.log("showMeshViewer 设置为 false");
};

// 测试按钮
const testBack = () => {
    console.log("测试按钮被点击");
    // 实现测试返回的逻辑
};
</script>

<style scoped>
.bg1 {
    background-image: url("@/assets/icons/icon/Frame-76.svg");
}

.bg2 {
    background-image: url("@/assets/icons/icon/Frame-77.svg");
}

.bg3 {
    background-image: url("@/assets/icons/icon/Frame-80.svg");
}

.bg4 {
    background-image: url("@/assets/icons/icon/切换图表.svg");
}

.bg5 {
    background-image: url("@/assets/icons/icon/Frame-81.svg");
}

.mine-scene-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

#cesiumContainer {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    /* background-image: url("./img/world2.png")!important;
  background-size: cover!important;
  background-repeat: no-repeat!important; */
}

:deep(.cesium-viewer-bottom) {
    display: none !important;
}

:deep(.cesium-viewer-toolbar) {
    top: 95px;
    right: 435px;
    display: none !important;
}

:deep(.cesium-viewer-fullscreenContainer) {
    top: 100px;
    right: 400px;
    display: none !important;
}

:deep(.cesium-infoBox) {
    right: 400px;
    top: 135px;
    display: none !important;
}

.btnText {
    font-size: 12px;
    margin-top: -2px;
    text-align: center;
    margin-bottom: 3px;
}

.fourbtns {
    background: #17c7fe;
    border-radius: 4px;
    width: 114px;
    height: 28px;
    border-radius: 10px;
    margin-bottom: 8px;
    line-height: 28px;
    font-size: 14px;
    text-align: center;
}

.fourbtn {
    border-radius: 4px;
    background: #0e1e317f;
    width: 114px;
    height: 28px;
    border-radius: 10px;
    margin-bottom: 8px;
    line-height: 28px;
    font-size: 14px;
    text-align: center;
}

.fourlayer2 {
    border-radius: 4px;
    background: #1b5a9784;
    width: 120px;
    padding: 13px 4px 4px 4px;
    position: absolute;
    left: 60px;
    top: 138px;
}

.fourlayer2:hover {
    cursor: pointer;
}

.fourlayer {
    border-radius: 4px;
    background: #1b5a9784;
    width: 120px;
    padding: 13px 4px 4px 4px;
    position: absolute;
    left: 60px;
    top: 135px;
}

.fourlayer:hover {
    cursor: pointer;
}

.fourlayer1 {
    border-radius: 4px;
    background: #1b5a9784;
    width: 120px;
    padding: 13px 4px 4px 4px;
    position: absolute;
    left: 60px;
    top: 68px;
}

.fourlayer1:hover {
    cursor: pointer;
}

.btnbox {
    position: absolute;
    top: 81px;
    left: 490px;
    width: 48px;
    height: auto;
}

.btnbox1 {
    position: absolute;
    top: 20px;
    left: 383px;
    width: 48px;
    height: auto;
}

.btnoneBox {
    width: 48px;
    height: 48px;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    margin-bottom: 8px;
}

.btnoneBox:hover {
    cursor: pointer;
}

.back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    cursor: pointer;
    transition: all 0.3s ease;
    pointer-events: auto;
    user-select: none;
}

.back-button:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
}

.test-button {
    position: absolute;
    top: 20px;
    left: 100px;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    cursor: pointer;
    transition: all 0.3s ease;
    pointer-events: auto;
    user-select: none;
}

.test-button:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
}
</style>