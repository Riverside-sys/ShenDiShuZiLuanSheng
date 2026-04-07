<!-- two -->
<template>
    <div>
        <V3Echarts
            :height="240"
            :options="option"
            :top="10"
            container="container3"
        />
    </div>
</template>

<script lang="ts" setup>
import * as echarts from "echarts";

import V3Echarts from "@/components/V3Echarts/index.vue";
var trafficWay = [
    {
        name: "正常",
        value: 14294,
    },
    {
        name: "报警",
        value: 314,
    },

    {
        name: "离线",
        value: 5137,
    },
    {
        name: "故障",
        value: 245,
    },
];

var data = [];
var color = ["#00ffff", "#ffa800", "#aaaaaa", "#ff3000"];
for (var i = 0; i < trafficWay.length; i++) {
    data.push(
        {
            value: trafficWay[i].value,
            name: trafficWay[i].name,
            itemStyle: {
                borderWidth: 3,
                shadowBlur: 20,
                borderColor: color[i] + "aa",
                shadowColor: color[i] + "99",
            },
        },
        {
            value: 2,
            name: "",
            itemStyle: {
                label: {
                    show: false,
                },
                labelLine: {
                    show: false,
                },
                color: "rgba(0, 0, 0, 0)",
                borderColor: "rgba(0, 0, 0, 0)",
                borderWidth: 0,
            },
        }
    );
}
var scaleData = [20, 20, 27, 23];

var placeHolderStyle = {
    label: {
        show: false,
    },
    labelLine: {
        show: false,
    },
    color: "rgba(0, 0, 0, 0)",
    borderColor: "rgba(0, 0, 0, 0)",
    borderWidth: 0,
};
var datas = [];
for (let i = 0; i < scaleData.length; i++) {
    datas.push(
        {
            value: scaleData[i],
            itemStyle: {
                borderWidth: 2,
                shadowBlur: 30,
                borderColor: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                    {
                        offset: 0,
                        color: "#F3C00400",
                    },
                    {
                        offset: 1,
                        color: "#F3C00488",
                    },
                ]),
                shadowColor: "rgba(142, 152, 241, 0.6)",
            },
        },
        {
            value: 4,
            itemStyle: placeHolderStyle,
        }
    );
}
var seriesOption = [
    {
        name: "",
        type: "pie",
        clockwise: false,
        radius: ["56%", "63%"],
        center: ["50%", "60%"],
        //hoverAnimation: false,
        itemStyle: {
            label: {
                show: true,
                position: "outside",
                color: "#ddd",
                formatter: function (params: any) {
                    var total = 0;
                    for (var i = 0; i < trafficWay.length; i++) {
                        total += trafficWay[i].value;
                    }
                    const percent = ((params.value / total) * 100).toFixed(0);
                    if (params.name !== "") {
                        return `${params.name}设备:${percent}%`;
                    } else {
                        return "";
                    }
                },
                labelLine: {
                    length: 20,
                    show: true,
                    color: "#00ffff",
                },
            },
        },
        data: data,
    },
    {
        name: "",
        type: "pie",
        clockwise: true,
        radius: ["43%", "44%"],
        center: ["50%", "60%"],
        //hoverAnimation: false,
        itemStyle: {
            label: {
                show: true,
                position: "outside",
                color: "#ddd",
            },
            labelLine: {
                show: false,
            },
        },

        data: datas,
    },
];
const option = {
    color: color,
    title: {
        text: "设备状态",
        left: "center",
        top: "54%",

        color: "#fff",
        fontSize: 16,
        fontWeight: "400",
    },

    legend: {
        icon: "circle",
        data: ["正常", "报警", "离线", "故障"],
        left: 20,
        top: 0,

        color: "#fff",
        itemGap: 12,
    },

    series: seriesOption,
};
</script>
