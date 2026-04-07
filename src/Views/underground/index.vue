<template>
    <div class="underground-container">
        <!-- 根据当前场景索引显示对应的组件 -->
        <div v-if="key === 0" class="scene-wrapper">
            <MineScene />
        </div>
        <div v-else-if="key === 1" class="scene-wrapper">
            <AquiferScene />
        </div>
        <div v-else-if="key === 2" class="scene-wrapper">
            <SaltcaveScene />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import MineScene from "@/Views/underground/mines/index.vue";
import AquiferScene from "@/Views/underground/aquifer/index.vue";
import SaltcaveScene from "@/Views/underground/saltcave/index.vue";

const route = useRoute();

// 当前场景索引
const key = ref(0);

// 场景数据映射
const sceneData = [
    { id: "mines", name: "废弃矿井", route: "/underground/mines" },
    { id: "aquifer", name: "含水层", route: "/underground/aquifer" },
    { id: "saltcave", name: "盐穴", route: "/underground/saltcave" },
];

// 根据路由路径确定当前场景
const getSceneIdFromRoute = (path) => {
    if (path.includes("/aquifer")) return "aquifer";
    if (path.includes("/saltcave")) return "saltcave";
    return "mines"; // 默认矿井场景
};

// 根据场景ID获取索引
const getSceneIndexFromId = (sceneId) => {
    return sceneData.findIndex((scene) => scene.id === sceneId);
};

// 监听路由变化，更新当前场景索引
watch(
    () => route.path,
    (newPath) => {
        const sceneId = getSceneIdFromRoute(newPath);
        const sceneIndex = getSceneIndexFromId(sceneId);
        if (sceneIndex !== key.value) {
            key.value = sceneIndex;
        }
    }
);

onMounted(() => {
    // 根据初始路由设置当前场景索引
    const sceneId = getSceneIdFromRoute(route.path);
    key.value = getSceneIndexFromId(sceneId);
});
</script>

<style scoped>
.underground-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
}

.scene-wrapper {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}
</style>
