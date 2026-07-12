<template>
  <div class="chart-card">
    <div class="chart-title">苏95真实岩性构成</div>
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
const topShares = model.lithologyShares.slice(0, 8);

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  chart.setOption({
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(8,18,32,0.9)",
      borderColor: "rgba(23,199,254,0.3)",
      textStyle: { color: "#e0f4ff", fontSize: 11 },
      formatter: "{b}<br/>层数：{c}<br/>占比：{d}%",
    },
    legend: {
      type: "scroll",
      orient: "vertical",
      right: 4,
      top: 10,
      bottom: 10,
      textStyle: { color: "rgba(255,255,255,0.7)", fontSize: 10 },
      pageTextStyle: { color: "rgba(255,255,255,0.55)" },
    },
    series: [
      {
        name: "苏95岩性",
        type: "pie",
        radius: ["42%", "68%"],
        center: ["38%", "52%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: "rgba(4,15,27,0.85)",
          borderWidth: 1,
        },
        label: {
          color: "rgba(224,244,255,0.85)",
          fontSize: 10,
          formatter: "{d}%",
        },
        data: topShares.map((item) => ({
          name: item.name,
          value: item.count,
        })),
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
