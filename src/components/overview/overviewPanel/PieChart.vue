<!-- two -->
<template>
    <div class="flex-box">
        <div class="list">
            <div class="item">
                <div class="top">
                    <span class="label">计划生产</span>
                    <span class="unit" style="color: #7cc1ff">万吨</span>
                </div>
                <div class="bottom">
                    <span class="label">plan</span>
                    <span class="count" style="color: #7cc1ff">300.00</span>
                </div>
            </div>
            <div class="item">
                <div class="top">
                    <span class="label">实际生产</span>
                    <span class="unit" style="color: #e29f00">万吨</span>
                </div>
                <div class="bottom">
                    <div class="label">practical</div>
                    <div class="count" style="color: #e29f00">81.23</div>
                </div>
            </div>
        </div>
        <div>
            <V3Echarts
                :width="150"
                :height="200"
                :options="option"
                :top="10"
                container="container3"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import * as echarts from "echarts";

import V3Echarts from "@/components/V3Echarts/index.vue";
const option = {
    color: ["#E29F1E", "#E29F1E22"],
    title: [
        {
            text: "27%",
            left: "center",
            top: "38%", // 大小可改
            textStyle: {
                fontSize: 20,
                color: "#fff",
            },
        },
        {
            text: "完成率",
            left: "center",
            top: "53%", // 大小可改
            textStyle: {
                fontSize: 16,
                color: "#A8CCDE",
            },
        },
    ],
    series: [
        {
            type: "pie",
            name: "外圆环",
            radius: ["87%", "90%"],
            center: ["50%", "50%"],
            //hoverAnimation: false,
            itemStyle: {
                color: "rgba(255, 255, 0, 0.25)",
            },
            label: {
                show: false,
            },
            data: [100],
        },
        {
            name: "",
            type: "pie",
            radius: ["65%", "80%"],
            center: ["50%", "50%"],
            silent: true,
            clockwise: true,
            startAngle: 90,
            z: 0,
            zlevel: 0,
            label: {
                show: false,
            },
            labelLine: {
                show: false,
            },
            data: [
                { name: "", value: 27 },
                { name: "", value: 63 },
            ],
        },
        {
            type: "gauge",
            radius: "59%",
            center: ["50%", "50%"],
            clockwise: true,
            startAngle: 0,
            endAngle: 359.9,
            splitNumber: 80,
            //hoverAnimation: true,
            axisTick: {
                show: false,
            },
            splitLine: {
                length: 30,
                lineStyle: {
                    width: 2,
                    color: "#03102a",
                },
            },
            axisLabel: {
                show: false,
            },
            pointer: {
                show: false,
            },
            axisLine: {
                show: false,
            },
            detail: {
                show: false,
            },
        },
    ],
};
</script>

<style lang="scss" scoped>
.flex-box {
    display: flex;
    align-items: center;
    width: 100%;
    height: 200px;

    .list {
        width: 200px;
        .item {
            margin: 5px 10px;
            padding: 5px 10px;
            .top {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                .label {
                }
            }
            .bottom {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                .label {
                    color: #bbb;
                }
                .count {
                    font-size: 18px;
                    font-family: "Arial", sans-serif;
                }
            }
        }
    }
}
</style>
