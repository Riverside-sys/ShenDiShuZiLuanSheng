<!-- two -->
<template>
    <V3Echarts
        :height="300"
        :options="option"
        :top="10"
        container="container3"
    />
</template>

<script lang="ts" setup>
import * as echarts from "echarts";

import V3Echarts from "@/components/V3Echarts/index.vue";
import {
    AXIS_LABEL,
    LEGEND,
    LINE_TOOLTIP,
    XAXIS_NAME,
    YAXIS_NAME,
} from "@/utils/chartConfig";
const option = {
    tooltip: LINE_TOOLTIP,
    legend: {
        icon: "rect",
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 15,
        top: "5%",
        right: "5%",
        textStyle: LEGEND,
        data: [
            {
                name: "煤矿生产",
                icon: "rect",
                itemStyle: {
                    color: "#FF9433",
                },
            },
        ],
    },
    grid: {
        top: "20%",
        left: "0%",
        right: "3%",
        bottom: "0%",
        containLabel: true,
    },
    xAxis: {
        type: "category",
        data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        axisLabel: {
            interval: "auto",

            color: "#fff",
            fontSize: 13,
        },
        axisLine: {
            show: true,
        },
        boundaryGap: false,
        splitLine: {
            show: false, //隐藏或显示
        },
    },
    yAxis: {
        type: "value",
        name: "(吨)",
        offset: 0,
        axisLine: {
            show: true,
        },
        axisLabel: AXIS_LABEL,
        // data:[100,200,300,400],
        nameTextStyle: YAXIS_NAME,
        splitLine: {
            show: false, //隐藏或显示
        },
    },
    series: [
        {
            name: "煤矿生产",
            type: "line",
            data: [47.9, 55.2, 61.2, 68.3, 79.5, 82, 88.44],
            smooth: true,
            symbol: "none",
            lineStyle: {
                color: "#FF9433",
                width: "1",
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0.5, color: "rgba(255, 148, 51, 0.2)" }, // 0% 处的颜色
                    { offset: 1, color: " RGB(36,46,70)" },
                ]),
            },
        },
    ],
};
</script>

<style lang="scss" scoped></style>
