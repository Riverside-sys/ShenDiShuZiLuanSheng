<template>
  <section class="data-card horizon-card">
    <header>
      <div>
        <small>TRACKED HORIZON · INTERPRETED</small>
        <h3>目标层位深度范围</h3>
      </div>
      <span class="target">≈ 720 m</span>
    </header>
    <div ref="chartRef" class="chart-body"></div>
    <p>黄色点为约 720 m 波谷种子；范围由同相轴自动追踪得到。</p>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as echarts from "echarts";
import { JIDA_SEISMIC_SECTIONS as sections } from "@/data/aquifer/jidaSeismic";

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  chart.setOption({
    animationDuration: 700,
    grid: { top: 12, right: 18, bottom: 28, left: 43 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(5, 16, 30, .96)",
      borderColor: "rgba(255, 207, 74, .45)",
      textStyle: { color: "#effbff", fontSize: 11 },
      formatter: (params: any) => {
        const item = sections[params[0]?.dataIndex];
        return item
          ? `<b>${item.id}</b><br/>追踪范围 ${item.horizonMinimumM}–${item.horizonMaximumM} m<br/>种子深度 ${item.targetDepthM} m<br/>${item.placement}`
          : "";
      },
    },
    xAxis: {
      type: "value",
      min: 620,
      max: 880,
      name: "深度 / m",
      nameTextStyle: { color: "rgba(166, 207, 218, .64)", fontSize: 9 },
      axisLabel: { color: "rgba(190, 222, 230, .55)", fontSize: 9 },
      splitLine: { lineStyle: { color: "rgba(50, 189, 210, .08)" } },
      axisLine: { lineStyle: { color: "rgba(65, 203, 225, .25)" } },
    },
    yAxis: {
      type: "category",
      data: sections.map((item) => item.id),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "rgba(65, 203, 225, .25)" } },
      axisLabel: { color: "rgba(220, 250, 255, .78)", fontWeight: 700 },
    },
    series: [
      {
        type: "custom",
        renderItem: (_params: any, api: any) => {
          const row = api.value(0);
          const start = api.coord([api.value(1), row]);
          const end = api.coord([api.value(2), row]);
          const height = api.size([0, 1])[1] * 0.34;
          return {
            type: "rect",
            shape: { x: start[0], y: start[1] - height / 2, width: end[0] - start[0], height, r: 4 },
            style: {
              fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: "rgba(40, 207, 224, .18)" },
                { offset: .5, color: "rgba(67, 224, 210, .7)" },
                { offset: 1, color: "rgba(40, 207, 224, .18)" },
              ]),
            },
          };
        },
        encode: { x: [1, 2], y: 0 },
        data: sections.map((item, index) => [index, item.horizonMinimumM, item.horizonMaximumM]),
      },
      {
        type: "scatter",
        symbolSize: 10,
        data: sections.map((item, index) => [item.targetDepthM, index]),
        itemStyle: { color: "#ffd84d", shadowColor: "rgba(255, 216, 77, .8)", shadowBlur: 8 },
        z: 5,
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
.data-card {
  min-height: 218px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(33, 202, 229, 0.22);
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(8, 25, 42, 0.94), rgba(4, 14, 28, 0.84));
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
}
header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 13px 14px 6px;
  small { display: block; color: rgba(81, 218, 235, .55); font-size: 8px; letter-spacing: 1.3px; }
  h3 { margin: 3px 0 0; color: #dffaff; font-size: 14px; font-weight: 650; }
  .target { color: #ffd84d; font: 600 14px/1 monospace; }
}
.chart-body { min-height: 135px; flex: 1; }
p {
  margin: 0;
  padding: 8px 12px 9px;
  border-top: 1px solid rgba(53, 204, 225, .1);
  color: rgba(190, 225, 232, .56);
  font-size: 9px;
  line-height: 1.45;
}
</style>
