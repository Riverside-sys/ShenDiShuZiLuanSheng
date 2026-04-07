<template>
    <div class="header-links">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item"
            :class="{ active: isActive(item.path) }">
            <img :src="isActive(item.path) ? item.activeIcon : item.normalIcon" class="nav-icon" />
            {{ item.title }}
        </router-link>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const navItems = ref([
    {
        title: "废弃矿井",
        path: "/underground/mines",
        normalIcon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmYiIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bS0xIDE3LjkzYy0zLjk1LS40OS03LTMuODUtNy03LjkzIDAtLjYyLjA4LTEuMjEuMjEtMS43OUw5IDEzdjFjMCAxLjEuOSAyIDIgMnYzLjkzem02LjktMi41NGMtLjI2LS44MS0xLTEuMzktMS45LTEuMzloLTF2LTNjMC0uNTUtLjQ1LTEtMS0xSDhWOGgyczEuNTUgMiAzIDJjMS41NSAwIDMgMiAzIDJ2MmgyYzEuNTUgMCAzIDIgMyAydi4wMWMwLS4wMS0uMDEtLjAyLS4wMi0uMDJ6Ii8+PC9zdmc+",
        activeIcon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2VlYTQ0OSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bS0xIDE3LjkzYy0zLjk1LS40OS03LTMuODUtNy03LjkzIDAtLjYyLjA4LTEuMjEuMjEtMS43OUw5IDEzdjFjMCAxLjEuOSAyIDIgMnYzLjkzem02LjktMi41NGMtLjI2LS44MS0xLTEuMzktMS45LTEuMzloLTF2LTNjMC0uNTUtLjQ1LTEtMS0xSDhWOGgyczEuNTUgMiAzIDJjMS41NSAwIDMgMiAzIDJ2MmgyYzEuNTUgMCAzIDIgMyAydi4wMWMwLS4wMS0uMDEtLjAyLS4wMi0uMDJ6Ii8+PC9zdmc+"
    },
    {
        title: "含水层",
        path: "/underground/aquifer",
        normalIcon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmYiIgZD0iTTE0IDZsLTMuNzUgNSAyLjg1IDMuOC0xLjYgMS4yQzkuODEgMTMuNzUgNyAxMCA3IDEwbC02IDhjMCAwIDExLjU0IDguNzYgMTguNjYgMy4zNUM4LjE1IDExLjggMTQgNiAxNCA2eiIvPjwvc3ZnPg==",
        activeIcon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2VlYTQ0OSIgZD0iTTE0IDZsLTMuNzUgNSAyLjg1IDMuOC0xLjYgMS4yQzkuODEgMTMuNzUgNyAxMCA3IDEwbC02IDhjMCAwIDExLjU0IDguNzYgMTguNjYgMy4zNUM4LjE1IDExLjggMTQgNiAxNCA2eiIvPjwvc3ZnPg=="
    },
    {
        title: "盐穴",
        path: "/underground/saltcave",
        normalIcon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmYiIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0tMi41LTUuNWw3LTQuNS01IDctMS41LTEuNSA0LjUtMi45LTQuNSAzLjYtLjUtMS43eiIvPjwvc3ZnPg==",
        activeIcon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2VlYTQ0OSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0tMi41LTUuNWw3LTQuNS01IDctMS41LTEuNSA0LjUtMi45LTQuNSAzLjYtLjUtMS43eiIvPjwvc3ZnPg=="
    }
]);

// 判断导航项是否应该高亮
const isActive = (itemPath: string) => {
    return route.path.startsWith(itemPath);
};
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
        display: flex;
        align-items: center;
        gap: 8px;

        .nav-icon {
            width: 18px;
            height: 18px;
            transition: all 0.3s;
        }

        &:hover {
            color: #eea449;
            /* 修改为金黄色 */
        }

        &.active {
            color: #eea449;
            /* 修改为金黄色 */
            font-weight: bold;

            &::after {
                content: "";
                position: absolute;
                bottom: -2px;
                left: 20%;
                width: 60%;
                height: 3px;
                background: #eea449;
                /* 下划线也修改为金黄色 */
                border-radius: 2px;
            }
        }
    }
}
</style>