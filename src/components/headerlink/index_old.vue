<template>
    <div class="header-links">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item"
            :class="{ active: isActive(item.path) }">
            {{ item.title }}
        </router-link>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

// 获取当前路由
const route = useRoute();

// 根据场景类型定义不同的导航项
const getNavItemsByScene = (sceneType: string) => {
    const basePath = `/underground/${sceneType}`;

    switch (sceneType) {
        case "mines":
            return [
                { title: "总览", path: `${basePath}` },
                { title: "工艺流程", path: `${basePath}/craft` },
                { title: "储能管控", path: `${basePath}/energy` },
                { title: "视频监测", path: `${basePath}/monitor` },
                { title: "环境信息", path: `${basePath}/environment` },
                { title: "应急管理", path: `${basePath}/emergency` },
            ];
        case "aquifer":
            return [
                { title: "总览", path: `${basePath}` },
                { title: "工艺流程", path: `${basePath}/craft` },
                { title: "封存管控", path: `${basePath}/energy` },
                { title: "卤水监测", path: `${basePath}/monitor` },
                { title: "环境信息", path: `${basePath}/environment` },
                { title: "应急管理", path: `${basePath}/emergency` },
            ];
        case "saltcave":
            return [
                { title: "总览", path: `${basePath}` },
                { title: "工艺流程", path: `${basePath}/craft` },
                { title: "储氢管控", path: `${basePath}/energy` },
                { title: "腔体监测", path: `${basePath}/monitor` },
                { title: "环境信息", path: `${basePath}/environment` },
                { title: "应急管理", path: `${basePath}/emergency` },
            ];
        default:
            // 默认返回矿井场景的导航项
            return [
                { title: "总览", path: "/underground/mines" },
                { title: "工艺流程", path: "/underground/mines/craft" },
                { title: "储能管控", path: "/underground/mines/energy" },
                { title: "视频监测", path: "/underground/mines/monitor" },
                { title: "环境信息", path: "/underground/mines/environment" },
                { title: "应急管理", path: "/underground/mines/emergency" },
            ];
    }
};

// 根据当前路由路径确定场景类型
const getCurrentSceneType = (path: string): string => {
    if (path.includes("/aquifer")) return "aquifer";
    if (path.includes("/saltcave")) return "saltcave";
    if (path.includes("/mines")) return "mines";
    return "mines"; // 默认矿井场景
};

// 响应式的导航项
const navItems = ref(getNavItemsByScene(getCurrentSceneType(route.path)));

// 判断导航项是否应该高亮
const isActive = (itemPath: string) => {
    const currentPath = route.path;
    const sceneType = getCurrentSceneType(currentPath);
    const basePath = `/underground/${sceneType}`;

    // 如果是总览项，只有当前路径完全等于场景主路径时才高亮
    if (itemPath === basePath) {
        return currentPath === basePath;
    }

    // 对于其他功能页面，只有当前路径完全匹配时才高亮
    return currentPath === itemPath;
};

// 监听路由变化，更新导航项
watch(
    () => route.path,
    (newPath) => {
        const sceneType = getCurrentSceneType(newPath);
        navItems.value = getNavItemsByScene(sceneType);
    }
);
</script>

<style lang="scss" scoped>
.header-links {
    display: flex;
    align-items: center;
    height: 100%;

    .nav-item {
        padding: 0 20px;
        height: 40px;
        line-height: 40px;
        color: #fff;
        text-decoration: none;
        font-size: 16px;
        transition: all 0.3s;
        position: relative;

        &:hover {
            color: #7afafe;
        }

        &.active {
            color: #7afafe;
            font-weight: bold;

            &::after {
                content: "";
                position: absolute;
                bottom: -2px;
                left: 20%;
                width: 60%;
                height: 3px;
                background: #7afafe;
                border-radius: 2px;
            }
        }
    }
}
</style>
