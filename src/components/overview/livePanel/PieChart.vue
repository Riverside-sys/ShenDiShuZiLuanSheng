<!-- two -->
<template>
    <V3Echarts
        :height="200"
        :options="option"
        :top="10"
        container="container3"
    />
</template>

<script lang="ts" setup>
import * as echarts from "echarts";

import V3Echarts from "@/components/V3Echarts/index.vue";
//  数据配置
const source = [
    ["出入口", "入场", "离场", "黑名单车辆"],
    ["东出入口", 338, 210, 40],
    ["北出入口", 416, 245, 33],
    ["西出入口", 518, 214, 13],
];
const colorArr = ["#49CCFFee", "#20D3ABee", "#FDD56Aee"];
const colorAlpha = ["#49CCFF44", "#20D3AB44", "#FDD56A44"];
const title = "合计";
const piedata = [
    {
        name: "入场",
        value: 1272,
        itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            borderColor: colorAlpha[0],
            shadowColor: colorArr[0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                    offset: 0,
                    color: colorArr[0],
                },
                {
                    offset: 1,
                    color: colorAlpha[0],
                },
            ]),
        },
    },
    {
        name: "离场",
        value: 669,
        itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            borderColor: colorAlpha[1],
            shadowColor: colorArr[1],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                    offset: 0,
                    color: colorArr[1],
                },
                {
                    offset: 1,
                    color: colorAlpha[1],
                },
            ]),
        },
    },
    {
        name: "黑名单车辆",
        value: 86,
        itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            borderColor: colorAlpha[2],
            shadowColor: colorArr[2],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                    offset: 0,
                    color: colorArr[2],
                },
                {
                    offset: 1,
                    color: colorAlpha[2],
                },
            ]),
        },
    },
];

// 图表配置

const option = {
    // backgroundColor: '#fff',
    dataset: {
        source: source,
    },
    title: [
        {
            left: "18.5%",
            top: "center",
            text: title,
            textAlign: "center",
            textStyle: {
                fontSize: 14,
                fontWeight: "bolder",
                color: "#fff",
            },
            subtext: "1350辆",
            subtextStyle: {
                fontSize: 12,
                fontWeight: "normal",
                color: "#fff",
            },
        },
    ],
    grid: {
        left: "53%",
        right: "5%",
        top: "20%",
        bottom: "12%",
    },
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "cross",
        },
        padding: 16,
    },
    legend: {
        show: true,
        left: "center",
        top: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
            color: "#fff",
            fontWeight: "bolder",
        },
    },
    color: ["#73DDFF", "#73ACFF", "#FDD56A"],
    yAxis: {
        type: "category",
        axisLine: {
            show: false,
        },
        axisTick: {
            show: false,
        },
        axisLabel: {
            color: "#fff",
            fontWeight: "bolder",
        },
    },
    xAxis: {
        type: "value",
        axisLine: {
            show: false,
        },
        axisTick: {
            show: false,
        },
        splitNumber: 3,
        axisLabel: {
            color: "#fff",
            fontWeight: "bolder",
        },
        splitLine: {
            lineStyle: {
                type: "dashed",
            },
        },
    },
    series: [
        {
            type: "bar",
            name: source[0][1],
            barWidth: 20,
            stack: true,
            encode: {
                y: 0,
                x: 1,
            },
            itemStyle: {
                borderWidth: 2,
                shadowBlur: 20,
                borderColor: colorAlpha[0],
                shadowColor: colorArr[0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                        offset: 0,
                        color: colorArr[0],
                    },
                    {
                        offset: 1,
                        color: colorAlpha[0],
                    },
                ]),
            },
            label: {
                show: true,
                color: "#fff",
                fontWeight: "bolder",
            },
        },
        {
            type: "bar",
            name: source[0][2],
            barWidth: 20,
            stack: true,
            encode: {
                y: 0,
                x: 2,
            },
            itemStyle: {
                borderWidth: 2,
                shadowBlur: 20,
                borderColor: colorAlpha[1],
                shadowColor: colorArr[1],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                        offset: 0,
                        color: colorArr[1],
                    },
                    {
                        offset: 1,
                        color: colorAlpha[1],
                    },
                ]),
            },
            label: {
                show: true,
                color: "#fff",
                fontWeight: "bolder",
            },
        },
        {
            type: "bar",
            name: source[0][3],
            barWidth: 20,
            stack: true,
            encode: {
                y: 0,
                x: 3,
            },
            itemStyle: {
                borderWidth: 2,
                shadowBlur: 20,
                borderColor: colorAlpha[2],
                shadowColor: colorArr[2],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                        offset: 0,
                        color: colorArr[2],
                    },
                    {
                        offset: 1,
                        color: colorAlpha[2],
                    },
                ]),
            },
            label: {
                show: true,
                color: "#fff",
                fontWeight: "bolder",
            },
        },
        {
            type: "pie",
            z: 100,
            radius: ["40%", "60%"],
            center: ["20%", "55%"],
            data: piedata,
            tooltip: {
                trigger: "item",
                formatter: "{a} <br/>{b} : {c}",
            },
            label: {
                show: false,
                position: "center",
                fontSize: 12,
                formatter: "{c}辆",
                color: "#fff",
            },
        },
    ],
};
</script>
