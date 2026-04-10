<template>
  <div class="chart-card">
    <div class="chart-title">地下水位动态监测</div>
    <div ref="chartRef" class="chart-body"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

const wellData = [
  { name: '1# 监测井', values: [12.3, 12.1, 11.8, 11.5, 11.2, 11.0, 10.8, 10.9, 11.2, 11.6, 12.0, 12.4, 12.8, 13.0, 13.1, 12.9, 12.6, 12.3, 12.0, 11.8, 11.6, 11.5, 11.7, 12.0] },
  { name: '2# 监测井', values: [8.5, 8.3, 8.1, 7.9, 7.7, 7.6, 7.5, 7.6, 7.8, 8.1, 8.4, 8.7, 9.0, 9.2, 9.3, 9.1, 8.9, 8.6, 8.4, 8.2, 8.0, 7.9, 8.0, 8.2] },
  { name: '3# 监测井', values: [15.1, 14.8, 14.5, 14.2, 13.9, 13.7, 13.5, 13.6, 13.9, 14.3, 14.7, 15.1, 15.5, 15.7, 15.8, 15.5, 15.2, 14.9, 14.6, 14.3, 14.1, 14.0, 14.2, 14.6] },
]

const colors = [
  ['rgba(23,199,254,0.8)', 'rgba(23,199,254,0.05)'],
  ['rgba(0,230,180,0.8)', 'rgba(0,230,180,0.05)'],
  ['rgba(255,170,50,0.8)', 'rgba(255,170,50,0.05)'],
]

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8,18,32,0.9)',
      borderColor: 'rgba(23,199,254,0.3)',
      textStyle: { color: '#e0f4ff', fontSize: 12 },
    },
    legend: {
      top: 4,
      right: 8,
      textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
      itemWidth: 12,
      itemHeight: 3,
    },
    grid: { top: 30, right: 12, bottom: 24, left: 40 },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: 'rgba(23,199,254,0.25)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, interval: 5 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '水位/m',
      nameTextStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },
      axisLine: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(23,199,254,0.08)' } },
    },
    series: wellData.map((well, i) => ({
      name: well.name,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: colors[i][0] },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors[i][0] },
          { offset: 1, color: colors[i][1] },
        ]),
      },
      data: well.values,
    })),
  })
}

let ro: ResizeObserver | null = null

onMounted(() => {
  initChart()
  if (chartRef.value) {
    ro = new ResizeObserver(() => chart?.resize())
    ro.observe(chartRef.value)
  }
})

onBeforeUnmount(() => {
  ro?.disconnect()
  chart?.dispose()
})
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
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #17c7fe;
  border-bottom: 1px solid rgba(23, 199, 254, 0.12);
  background: rgba(23, 199, 254, 0.06);
  letter-spacing: 1px;
  flex-shrink: 0;
}
.chart-body {
  width: 100%;
  flex: 1;
  min-height: 160px;
}
</style>
