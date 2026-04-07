<!-- 左侧面板组件 -->

<!-- left_box -->
<template>
    <div class="left_box">
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
// 移除动画条件，确保始终显示
</script>

<style lang="scss" scoped>
.left_box {
    position: absolute;
    width: 200px;
    height: 100%;
    background-image: linear-gradient(
        to left,
        rgba(16, 29, 41, 0) 0%,
        rgba(12, 23, 33, 0.62) 24%,
        #0a131cb9 100%
    );
    top: 0;
    left: 0;
    box-sizing: border-box;
    padding: 80px 0 30px 20px;
    z-index: 9;

    .content {
        width: 120px;
        height: 100%;
        box-sizing: border-box;
        position: relative;
        background-size: 100% 100%;
    }
}
</style>
