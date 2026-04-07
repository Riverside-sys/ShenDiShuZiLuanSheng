<script setup>
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as tagwork from "@/utils/mines_platform/mapData/tag.js";
import * as mapwork from "@/utils/mines_platform/cesium/demo1.js";
import { toRaw, ref, watch, onMounted, nextTick, onUnmounted } from "vue";
import { pointStore } from "@/stores/modules/point.js";
import { useRoute } from "vue-router";
// import { PersonnelPositioningApi } from '@/api/PersonnelPositioning.js'

const pointStores = pointStore();
const route = useRoute();
const routeUrl = ref(false);
if (
    route.path == "/integrated-disaster-prevention/hidden-danger-management" ||
    route.path == "/integrated-disaster-prevention/risk-assessment"
) {
    nextTick(() => {
        routeUrl.value = true;
    });
}
onMounted(() => {
    mapwork.init("cesiumContainer");
});
onUnmounted(() => {});
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
const isVisible = ref(false);
const dyisVisible = ref(false);
const typeVisible = ref(false);
function dytoggleShow() {
    dyisVisible.value = !dyisVisible.value;
    isVisible.value = false;
    typeVisible.value = false;
}
function toggleShow() {
    isVisible.value = !isVisible.value;
    dyisVisible.value = false;
    typeVisible.value = false;
}
function cadTypetoggleShow() {
    typeVisible.value = !typeVisible.value;
    dyisVisible.value = false;
    isVisible.value = false;
}
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
const btnActive1 = ref(false);
const btnArr = ref([
    { id: 1, name: "全矿" },
    { id: 2, name: "巷道标签" },
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
        //水泵房
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
        // // 工作面
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
        // 变电所
        mapwork.placeDiv(
            new Cesium.Color(0.556, 0.42, 0.039, 1.0),
            "/config/WaterRoom.png",
            tagwork.WaterRoom2
        );
    }
};
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
// 初始化场景
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
</script>

<template>
    <div>
        <div
            id="cesiumContainer"
            style="
                position: absolute;
                top: 0px;
                left: 0px;
                height: 100%;
                width: 100%;
            "
        ></div>
        <div :class="routeUrl == true ? 'btnbox1' : 'btnbox'">
            <a-tooltip placement="left">
                <div class="btnoneBox bg1" @click="init"></div>
                <div class="btnText">初始化</div>
            </a-tooltip>
            <a-tooltip placement="left">
                <div class="btnoneBox bg2" @click="dytoggleShow"></div>
                <div class="btnText">定位</div>
            </a-tooltip>
            <div class="fourlayer1" v-if="dyisVisible == true">
                <div
                    :class="dyActive1 == item.id ? 'fourbtns' : 'fourbtn'"
                    v-for="(item, index) in dyArr"
                    :key="index"
                    @click="dychange(item)"
                >
                    {{ item.name }}
                </div>
            </div>
            <!-- <a-tooltip placement="left">
      <div class="btnoneBox" @click="cadTypetoggleShow" :style="{ backgroundImage: `url(${frame78})` }"></div>
      <div class="btnText">视图切换</div>
    </a-tooltip>
    <div class="fourlayer2" v-if="typeVisible == true">
      <div :class="typeActive1 == item.id ? 'fourbtns' : 'fourbtn'" @click="cadTypechange(item)"
        v-for="(item, index) in typeArr" :key="index">{{ item.name }} </div>
    </div> -->
            <a-tooltip placement="left">
                <div class="btnoneBox bg3" @click="toggleShow"></div>
                <div class="btnText">煤层</div>
            </a-tooltip>
            <div class="fourlayer" v-if="isVisible == true">
                <div
                    :class="btnActive1 == item.id ? 'fourbtns' : 'fourbtn'"
                    @click="btnchange(item)"
                    v-for="(item, index) in btnArr"
                    :key="index"
                >
                    {{ item.name }}
                </div>
            </div>
            <a-tooltip placement="left">
                <div class="btnoneBox bg4" @click="toggleFullScreen"></div>
                <div class="btnText">全屏</div>
            </a-tooltip>
        </div>
    </div>
</template>

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
    background-image: url("@/assets/icons/icon/Frame-81.svg");
}
#cesiumContainer {
    width: 100%;
    height: 100vh;
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
</style>
