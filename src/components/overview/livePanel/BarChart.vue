<!-- two -->
<template>
    <V3Echarts
        :height="260"
        :options="option"
        :top="10"
        container="container3"
    />
</template>

<script lang="ts" setup>
import * as echarts from "echarts";

import V3Echarts from "@/components/V3Echarts/index.vue";
let data1 = [64, 53, 64, 28, 71];
let data2 = [421, 378, 359, 214, 516];
const option = {
    legend: {
        x: "center",
        y: "3%",
        itemWidth: 20,
        itemHeight: 15,

        fontSize: 12,
        color: "rgba(255,255,255,.7)",
    },
    grid: {
        left: "5%",
        top: "5%",
        right: "5%",
        bottom: "5%",
        containLabel: true,
    },
    yAxis: {
        name: "",
        type: "value",
        axisLabel: {
            show: false,
        },
        splitLine: {
            show: false,
        },
        axisTick: {
            show: false,
        },
        axisLine: {
            show: false,
        },
    },
    xAxis: {
        type: "category",
        nameTextStyle: {
            fontSize: 12,
            color: "#7dd6ea",
        },
        axisLabel: {
            show: true,
            interval: 0,
            margin: 20,

            color: "#7dd6ea",
            fontSize: 12,
        },
        splitLine: {
            show: false,
        },
        axisTick: {
            show: false,
        },
        axisLine: {
            show: true,
            lineStyle: {
                color: "#4E84AC",
                width: 3,
            },
        },
        data: ["北区", "东区", "西区", "南区"],
    },
    series: [
        {
            name: "车辆",
            type: "bar",
            barWidth: 20,
            barGap: "70%",
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                        offset: 0,
                        color: "rgba(0,234,255, 1)",
                    },
                    {
                        offset: 1,
                        color: "rgba(0,234,255, .3)",
                    },
                ]),
            },
            label: {
                show: true,
                position: "top",

                fontSize: 12,
                color: "#00EAFF",
                formatter: function (params: any) {
                    return params.value + "辆";
                },
            },
            data: data1,
            z: 10,
            zlevel: 0,
        },
        {
            // 分隔
            type: "pictorialBar",
            itemStyle: {
                color: "#0F375F",
            },
            symbolRepeat: "fixed",
            symbolMargin: 5,
            symbol: "rect",
            symbolClip: true,
            symbolSize: [20, 2],
            symbolPosition: "start",
            symbolOffset: [-17, 0],
            data: data1,
            width: 2,
            z: 0,
            zlevel: 1,
        },
        {
            name: "人员",
            type: "bar",
            barWidth: 20,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                        offset: 0,
                        color: "rgba(252,160,0, 1)",
                    },
                    {
                        offset: 1,
                        color: "rgba(252,160,0, .3)",
                    },
                ]),
            },
            label: {
                show: true,
                position: "top",

                fontSize: 12,
                color: "#FFA200",
                formatter: function (params: any) {
                    return params.value + "人";
                },
            },
            data: data2,
            z: 10,
            zlevel: 0,
        },
        {
            // 分隔
            type: "pictorialBar",
            itemStyle: {
                color: "#0F375F",
            },
            symbolRepeat: "fixed",
            symbolMargin: 10,
            symbol: "rect",
            symbolClip: true,
            symbolSize: [20, 2],
            symbolPosition: "start",
            symbolOffset: [17, 0],
            data: data2,
            width: 2,
            z: 0,
            zlevel: 1,
        },
    ],
};
</script>

<style lang="scss" scoped></style>
