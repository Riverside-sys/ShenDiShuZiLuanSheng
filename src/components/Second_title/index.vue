<template>
    <div class="alease_title_left">
        <!-- <Icon :icon="icon" fontSize="24" class="title_icon" /> -->
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
    height: 32px;
    font-size: 16px;
    margin-bottom: 5px;
    margin-top: 5px;
    overflow: hidden;
    background: url("./tiltle2_bg@2x.png") no-repeat;
    background-size: 100% 80%;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);

    .title-text {
        flex: 1;
        margin-left: 25px;
        position: relative;
        top: 1px;
        width: fit-content;
        margin-bottom: 14px;
        font-family: Tencent, serif;
    }
}
</style>
