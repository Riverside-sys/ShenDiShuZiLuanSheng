<template>
    <div class="pipe_btn">
        <div class="pipe-item" v-for="(item, i) in btn_data" :key="item.id">
            <div
                @click="click(i)"
                :class="activeIndex === i ? 'active' : 'btn'"
                class="btn"
            >
                <img v-if="activeIndex !== i" :src="item.normalIcon" alt="" />
                <img v-if="activeIndex === i" :src="item.activeIcon" alt="" />
                <div class="text">{{ item.name }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface BtnItem {
    id: number;
    name: string;
    normalIcon: string;
    activeIcon: string;
}

const props = defineProps<{
    btn_data: BtnItem[];
}>();

let activeIndex = ref(0);

const emit = defineEmits(["change"]);
const click = (i: number) => {
    activeIndex.value = i;
    emit("change", i);
};
</script>

<style lang="scss" scoped>
.pipe_btn {
    width: 140px;
    z-index: 99;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 40%;
    transform: translateY(-50%);
    transition: all 0.2s;
    left: 20px;

    .active {
        color: #eea449;
        border-bottom: 2px #e3bf6f solid;
        border-image: linear-gradient(to right, #eea449, #e6e4b2) 1 10;
        .text {
            background-image: -webkit-linear-gradient(left, #eea449, #e6e4b2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }

    .btn {
        margin-right: 30px;
        width: 120px;
        height: 70px;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
        img {
            width: 24px;
            height: 24px;
        }
        .text {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            line-height: 32px;
            font-family: "Arial", sans-serif;
            margin-bottom: 2px;
            margin-left: 5px;
            color: #fff;
        }
        &:hover {
            color: #eea449;
            .text {
                background-image: -webkit-linear-gradient(
                    left,
                    #eea449,
                    #e6e4b2
                );
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        }
    }
}
</style>
