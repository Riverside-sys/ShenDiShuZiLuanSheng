<!-- Equipment management 设备管理 -->
<template>
    <div>
        <FirstTitle>矿山综合指标</FirstTitle>
        <div class="index-list">
            <div class="item" v-for="item in indexList" :key="item.label">
                <div class="icon"></div>
                <div class="right">
                    <div class="label">{{ item.label }}</div>
                    <div class="count">
                        {{ item.count }}
                        <span>{{ item.unit }}</span>
                    </div>
                </div>
            </div>
        </div>
        <FirstTitle>煤矿完成率</FirstTitle>
        <PieChart />

        <FirstTitle>煤矿生产情况</FirstTitle>
        <LineChart />
    </div>
</template>

<script lang="ts" setup>
import LineChart from "./LineChart.vue";
import PieChart from "./PieChart.vue";

const indexList = [
    {
        label: "可采储量",
        count: "6.81",
        unit: "亿吨",
    },
    {
        label: "设计能力",
        count: "600",
        unit: "万吨/年",
    },
    {
        label: "地质储量",
        count: "12.8",
        unit: "亿吨",
    },
    {
        label: "井田面积",
        count: "19.94",
        unit: "km²",
    },
    {
        label: "开采面积",
        count: "12.8",
        unit: "km²",
    },
    {
        label: "煤储量",
        count: "19.94",
        unit: "亿吨",
    },
];
</script>

<style lang="scss" scoped>
.flex {
    display: flex;
    align-items: center;
}
.index-list {
    display: flex;
    flex-wrap: wrap;
    .item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50%;
        margin-bottom: 6px;
        padding: 10px 5px;
        .icon {
            width: 45px;
            height: 45px;
            margin-right: 10px;
            background: #7e5626;
            border-radius: 50%;
            padding: 5px;
            box-shadow: 0 0 10px #eea449;
        }
        .label {
            margin-bottom: 10px;
            font-weight: bold;
            background-image: -webkit-linear-gradient(bottom, #eea449, #e6e4b2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .count {
            font-family: "Arial", sans-serif;
            padding-bottom: 5px;
            span {
                font-family: "Arial", sans-serif;
                color: #aaa;
                font-size: 14px;
            }
            border-bottom: 1px solid #fff;
        }
    }
}
</style>
