<template>
  <div class="chart-card">
    <div class="chart-title">8口井真实测井深度范围</div>
    <div ref="chartRef" class="chart-body"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as echarts from "echarts";

import { createAquiferHudChartModel } from "../../utils/aquiferHudCharts";

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

const model = createAquiferHudChartModel();

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  chart.setOption({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(8,18,32,0.9)",
      borderColor: "rgba(23,199,254,0.3)",
      textStyle: { color: "#e0f4ff", fontSize: 11 },
      formatter: (params: any) => {
        const item = Array.isArray(params) ? params[0] : params;
        const well = model.wellDepthSpans[item.dataIndex];
        if (!well) return "";
        return `${well.wellId}<br>${well.minimum}–${well.maximum} m<br>跨度 ${well.span} m`;
      },
    },
    grid: { top: 18, right: 18, bottom: 28, left: 52 },
    xAxis: {
      type: "value",
      name: "深度 / m",
      nameTextStyle: { color: "rgba(160,200,220,0.75)", fontSize: 10 },
      axisLabel: { color: "rgba(255,255,255,0.55)", fontSize: 9 },
      splitLine: { lineStyle: { color: "rgba(23,199,254,0.08)" } },
      axisLine: { lineStyle: { color: "rgba(23,199,254,0.25)" } },
    },
    yAxis: {
      type: "category",
      data: model.wellDepthSpans.map((well) => well.wellId),
      axisLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10 },
      axisLine: { lineStyle: { color: "rgba(23,199,254,0.25)" } },
      splitLine: { show: false },
    },
    series: [
      {
        type: "custom",
        renderItem: (params: any, api: any) => {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = api.size([0, 1])[1] * 0.45;
          const shape = echarts.graphic.clipRectByRect(
            {
              x: start[0],
              y: start[1] - height / 2,
              width: Math.max(1, end[0] - start[0]),
              height,
            },
            {
              x: params.coordSys.x,
              y: params.coordSys.y,
              width: params.coordSys.width,
              height: params.coordSys.height,
            },
          );
          return shape
            ? {
                type: "rect",
                shape,
                style: {
                  fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: "rgba(23,199,254,0.35)" },
                    { offset: 1, color: "rgba(101,246,197,0.9)" },
                  ]),
                },
              }
            : undefined;
        },
        encode: { x: [1, 2], y: 0 },
        data: model.wellDepthSpans.map((well, index) => [
          index,
          well.minimum,
          well.maximum,
        ]),
      },
    ],
  });
}

onMounted(() => {
  initChart();
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => chart?.resize());
    resizeObserver.observe(chartRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
});
</script>

<style scoped lang="scss">
.chart-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgba(6, 16, 32, 0.75);
  border: 1px solid rgba(23, 199, 254, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  overflow: hidden;
}
.chart-title {
  padding: 9px 14px;
  font-size: 14px;
  font-weight: 600;
  color: rgb(23, 199, 254);
  border-bottom: 1px solid rgba(23, 199, 254, 0.12);
  background: rgba(23, 199, 254, 0.06);
  letter-spacing: 1px;
  flex-shrink: 0;
}
.chart-body {
  width: 100%;
  flex: 1;
  min-height: 190px;
}
</style>
