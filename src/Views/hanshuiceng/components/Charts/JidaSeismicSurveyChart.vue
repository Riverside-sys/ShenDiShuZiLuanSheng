<template>
  <section class="data-card">
    <header>
      <div>
        <small>JILIN DATA · MEASURED</small>
        <h3>三条地震测线规模</h3>
      </div>
      <strong>{{ summary.totalLineLengthKm.toFixed(2) }} km</strong>
    </header>
    <div ref="chartRef" class="chart-body"></div>
    <footer>
      <span>{{ summary.totalTraces.toLocaleString() }} 道</span>
      <span>CDP {{ summary.cdpSpacingM }} m</span>
      <span>DZ1 × DZ2 实测相交</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as echarts from "echarts";
import {
  JIDA_SEISMIC_SECTIONS as sections,
  JIDA_SEISMIC_SURVEY_SUMMARY as summary,
} from "@/data/aquifer/jidaSeismic";

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  chart.setOption({
    animationDuration: 700,
    grid: { top: 24, right: 30, bottom: 27, left: 38 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(5, 16, 30, .96)",
      borderColor: "rgba(30, 211, 235, .4)",
      textStyle: { color: "#dffaff", fontSize: 11 },
      formatter: (params: any) => {
        const item = sections[params[0]?.dataIndex];
        return item
          ? `<b>${item.id}</b><br/>${item.traceCount.toLocaleString()} 道 · ${item.lineLengthKm.toFixed(3)} km<br/>${item.depthSamples} 个深度采样点`
          : "";
      },
    },
    xAxis: {
      type: "category",
      data: sections.map((item) => item.id),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "rgba(65, 203, 225, .25)" } },
      axisLabel: { color: "rgba(220, 250, 255, .78)", fontWeight: 700 },
    },
    yAxis: {
      type: "value",
      name: "测线长度 / km",
      nameTextStyle: { color: "rgba(166, 207, 218, .64)", fontSize: 9 },
      axisLabel: { color: "rgba(190, 222, 230, .55)", fontSize: 9 },
      splitLine: { lineStyle: { color: "rgba(50, 189, 210, .08)" } },
    },
    series: [
      {
        type: "bar",
        barWidth: 24,
        data: sections.map((item, index) => ({
          value: item.lineLengthKm,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: index === 2 ? "#50e1c7" : "#24c8f3" },
              { offset: 1, color: "rgba(16, 107, 139, .18)" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        })),
        label: {
          show: true,
          position: "top",
          color: "rgba(225, 251, 255, .82)",
          fontSize: 9,
          formatter: ({ dataIndex }: any) =>
            `${sections[dataIndex].traceCount.toLocaleString()}道`,
        },
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
  min-height: 224px;
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
  padding: 13px 14px 7px;
  small { display: block; color: rgba(81, 218, 235, .55); font-size: 8px; letter-spacing: 1.4px; }
  h3 { margin: 3px 0 0; color: #dffaff; font-size: 14px; font-weight: 650; }
  strong { color: #4ee0cb; font: 600 15px/1 monospace; }
}
.chart-body { min-height: 142px; flex: 1; }
footer {
  display: flex;
  gap: 10px;
  padding: 8px 12px;
  border-top: 1px solid rgba(53, 204, 225, .1);
  color: rgba(190, 225, 232, .62);
  font-size: 9px;
  span + span { padding-left: 10px; border-left: 1px solid rgba(53, 204, 225, .15); }
}
</style>
