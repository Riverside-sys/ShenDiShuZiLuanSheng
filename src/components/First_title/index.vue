<template>
    <div class="alease_title_left">
        <div class="title-text">
            <slot>设备状态</slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    left: {
        type: Number,
        default: 20,
    },
    icon: {
        type: String,
        default: "tucengshu",
    },
});
</script>

<style lang="scss" scoped>
.alease_title_left {
    position: relative;
    font-family: Oppo;
    font-weight: 500;
    color: #ffffff;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 380px;
    height: 35px;
    font-size: 18px;
    margin-top: 10px;
    margin-bottom: 10px;
    overflow: hidden;
    background: url("./tiltle1_bg@2x.png") no-repeat;
    background-size: 100% 100%;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);

    .title_icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px;
        height: 32px;
        margin-bottom: 10px;
        color: #a2d1ff;
        font-size: 30px;
    }

    .title-text {
        flex: 1;
        margin-left: 40px;
        position: relative;
        top: 1px;
        width: fit-content;
        margin-bottom: 14px;
        font-family: Tencent, serif;
    }
}
</style>
