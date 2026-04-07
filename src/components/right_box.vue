<!-- 右侧面板组件 -->

<template>
    <div class="right_box">
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
// 移除动画条件，确保始终显示
</script>

<style lang="scss" scoped>
.right_box {
    position: absolute;
    width: 480px;
    height: 100%;
    background-image: linear-gradient(
        to right,
        rgba(16, 29, 41, 0) 0%,
        rgba(12, 23, 33, 0.62) 24%,
        #0a131cb9 100%
    );
    top: 0;
    right: 0;
    box-sizing: border-box;
    padding: 80px 20px 30px 0;
    display: flex;
    justify-content: right;
    z-index: 1;

    .content {
        width: 400px;
        height: 100%;
        box-sizing: border-box;
        position: relative;
        background-size: 100% 100%;
        padding: 10px;
    }
}
</style>
