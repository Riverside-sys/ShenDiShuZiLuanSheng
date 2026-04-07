<script setup>
import { computed, h, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RollbackOutlined } from "@ant-design/icons-vue";
// import mapContainer from "@/views/Platforms/GISIntelligentManagement/cesium/index.vue";
// import alarmList from "@/views/Platforms/GISIntelligentManagement/ArarmList/index.vue";
// import * as mapwork from "@/views/Platforms/GISIntelligentManagement/cesium/demo1.js";
import { useUserStore } from "@/stores/modules/user.js";
// import SimulationExercise from './SimulationExercise/index.vue'
const moduleName = "gis";

const leftMenu = [
    {
        key: `${moduleName}Overview`,
        label: "总览",
        name: `${moduleName}Overview`,
        path: "/gis-intelligent-management/overview",
    },
    {
        key: `${moduleName}SecurityDetection`,
        label: "安全监测",
        name: `${moduleName}SecurityDetection`,
        path: "/gis-intelligent-management/security-detection",
    },
    {
        key: `${moduleName}PersonnelPositioning`,
        label: "人员定位",
        name: `${moduleName}PersonnelPositioning`,
        path: "/gis-intelligent-management/personnel-positioning",
    },
    {
        key: `${moduleName}HydrologicDetection`,
        label: "水文监测",
        name: `${moduleName}HydrologicDetection`,
        path: "/gis-intelligent-management/hydrologic-detection",
    },
    {
        key: `${moduleName}FireDetection`,
        label: "火灾监测",
        name: `${moduleName}FireDetection`,
        path: "/gis-intelligent-management/fire-detection",
    },
];

const rightMenu = [
    {
        key: `${moduleName}OrePressureDetection`,
        label: "矿压监测",
        name: `${moduleName}OrePressureDetection`,
        path: "/gis-intelligent-management/ore-pressure-detection",
    },
    {
        key: `${moduleName}IndustrialVideo`,
        label: "视频监测",
        name: `${moduleName}IndustrialVideo`,
        path: "/gis-intelligent-management/industrial-video",
    },
    {
        key: `${moduleName}CommunicationDispatching`,
        label: "通讯调度",
        name: `${moduleName}CommunicationDispatching`,
        path: "/gis-intelligent-management/communication-dispatching",
    },
    {
        key: `${moduleName}EmergencyLinkage`,
        label: "应急联动",
        name: `${moduleName}EmergencyLinkage`,
        path: "/gis-intelligent-management/emergency-linkage",
    },
];

const activeKey = ref(2);

const activeClass = (key) => (activeKey.value === key ? "is-active" : "");

const router = useRouter();

const route = useRoute(); // Get current route information
const isKeepAlive = computed(() => route.meta.keepAlive); // Get keepAlive state

// 计算当前激活的菜单项的键
const computeActiveKey = () => {
    // 找出与当前路由相对应的菜单项
    const item = [...leftMenu, ...rightMenu].find((item) =>
        route.matched.some((record) => record.path === item.path)
    );
    // mapwork.clear();
    return item ? item.key : ""; // 如果找到了对应菜单项，返回它的键；否则，返回 -1
};

// 初始化激活的菜单项的键
activeKey.value = computeActiveKey();

// 当路由变化时，重新计算激活的菜单项的键
watch(route, () => {
    activeKey.value = computeActiveKey();
    // console.log('activeKey.value', activeKey.value)
});
import { pointStore } from "@/stores/modules/point.js";
import { useSimulationExerciseStore } from "@/stores/modules/useSimulationExerciseStore.js";
const pointStores = pointStore();
const handleItem = (item) => {
    activeKey.value = item.key;
    pointStores.rightShowClear();
    if (item.name) {
        router.push({ name: item.name });
        mapwork.clear();
        mapwork.popups.closeAll();
    }
};

const openModal = ref(false);
const handleClickAlarm = () => {
    openModal.value = true;
};

const userStore = useUserStore();

const handleLogout = () => {
    userStore.clearToken();
    userStore.setExpired(false);
    window.location.reload();
};

const simulationExerciseStore = useSimulationExerciseStore();
</script>

<template>
    <div class="layout w-full h-full">
        <div class="layout_head">
            <div class="header-left">
                <div
                    v-for="item in leftMenu"
                    :key="item.key"
                    class="header-left-item"
                    :class="activeClass(item.key)"
                    @click="handleItem(item)"
                >
                    {{ item.label }}
                </div>
            </div>
            <div class="header-right">
                <div
                    v-for="item in rightMenu"
                    :key="item.key"
                    class="header-right-item"
                    :class="activeClass(item.key)"
                    @click="handleItem(item)"
                >
                    {{ item.label }}
                </div>

                <a-button
                    class="z-30"
                    size="middle"
                    type="primary"
                    ghost
                    shape="circle"
                    @click="handleClickAlarm"
                >
                    <img src="/img/warn.png" class="w-20px" />
                </a-button>
            </div>
            <div class="layout_title">
                <span>煤矿安全管控平台</span>
            </div>
        </div>
        <div class="layout_content">
            <router-view v-slot="{ Component }">
                <template v-if="isKeepAlive">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </template>
                <component v-else :is="Component" />
            </router-view>
        </div>
        <div class="layout_footer"></div>
        <div class="absolute top-0 left-0 w-100% h-100%">
            <SimulationExercise
                v-show="simulationExerciseStore.showSimulationExercise"
            />
            <map-container
                v-show="!simulationExerciseStore.showSimulationExercise"
            />
        </div>

        <a-button
            class="absolute top-30px right-30px z-30"
            size="middle"
            type="primary"
            ghost
            :icon="h(RollbackOutlined)"
            @click="router.push('/home')"
        />
    </div>
    <!-- 告警列表弹框 -->
    <a-modal
        class="detail-modal-box"
        :open="openModal"
        title="告警列表"
        width="80%"
        centered
        :footer="null"
        @cancel="openModal = false"
    >
        <alarmList />
    </a-modal>
</template>

<style scoped lang="less">
.layout {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .layout_head {
        height: 80px;
        background: url("@/assets/images/head_bg.png") no-repeat center top;
        z-index: 30;
        position: relative;

        .layout_title {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            span {
                padding-left: 13px;
                font-family: "Alimama ShuHeiTi";
                font-size: 32px;
                font-style: normal;
                font-weight: 700;
                line-height: 80px; /* 100% */
                letter-spacing: 12px;
                background: linear-gradient(180deg, #c8d7e4 0%, #fff 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        }
        .header-left {
            position: absolute;
            display: flex;
            top: 30px;
            right: 1300px;
            .header-left-item {
                cursor: pointer;
                margin-right: 5px;
                background: url("@/assets/svgs/btn_right.svg") no-repeat center
                    center;

                &.is-active,
                &:hover {
                    background: url("@/assets/svgs/btn_right_active.svg")
                        no-repeat center center;
                }
            }
        }

        .header-right {
            position: absolute;
            display: flex;
            top: 30px;
            left: 1310px;

            .header-right-item {
                cursor: pointer;
                margin-right: 5px;
                background: url("@/assets/svgs/btn_left.svg") no-repeat center
                    center;

                &.is-active,
                &:hover {
                    background: url("@/assets/svgs/btn_left_active.svg")
                        no-repeat center center;
                }
            }
        }
        .header-left-item,
        .header-right-item {
            width: 106px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: "Alibaba PuHuiTi";
            font-size: 17px;
            font-style: normal;
            font-weight: 400;
        }
    }
    .layout_content {
        flex: 1;
        padding: 0 30px;
    }
    .layout_footer {
        width: 100%;
        height: 43px;
        background: url("@/assets/svgs/footer_bg.svg") no-repeat center top;
        z-index: 30;
    }
}
</style>
