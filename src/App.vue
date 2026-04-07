<template>
    <div class="layout">
        <LayoutHeader />
        <div class="layout-main">
            <router-view />
        </div>
    </div>
</template>

<script lang="ts" setup>
import LayoutHeader from "./components/header/index.vue";
</script>

<style lang="scss" scoped>
.layout {
    width: 100%;
    height: 100%;
    background-color: #000;
    background-image: url(@/assets/dianchang/page_bg.png);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    /* 建议：如果是全屏背景，考虑使用 cover 以适应不同比例屏幕 */

    /* 改用 Flex 布局 */
    display: flex;
    flex-direction: column;

    .layout-main {
        position: relative;
        width: 100%;
        /* 自动占据剩余高度，不再依赖固定的 60px */
        flex: 1;
        overflow: hidden;
    }
}
</style>
