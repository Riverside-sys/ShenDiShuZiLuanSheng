<template>
  <div class="chart-card">
    <div class="chart-title">各地层渗透率与孔隙度</div>
    <div ref="chartRef" class="chart-body"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const layers = ['杂填层', '粉质黏土', '粉砂', '细沙', '粉质黏土', '细沙', '粉砂', '粉质黏土', '粉质黏土']
const permeability = [35, 8, 120, 210, 12, 195, 145, 15, 10]
const porosity = [22, 8, 18, 26, 9, 24, 19, 7, 8]

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(8,18,32,0.9)',
      borderColor: 'rgba(23,199,254,0.3)',
      textStyle: { color: '#e0f4ff', fontSize: 11 },
    },
    legend: {
      top: 4,
      right: 8,
      textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
      itemWidth: 12,
      itemHeight: 8,
    },
    grid: { top: 30, right: 46, bottom: 50, left: 42 },
    xAxis: {
      type: 'category',
      data: layers,
      axisLine: { lineStyle: { color: 'rgba(23,199,254,0.25)' } },
      axisLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 9, rotate: 35, interval: 0 },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: '渗透率/mD',
        nameTextStyle: { color: 'rgba(160,120,255,0.7)', fontSize: 9 },
        axisLine: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },
        splitLine: { lineStyle: { color: 'rgba(23,199,254,0.06)' } },
      },
      {
        type: 'value',
        name: '孔隙度/%',
        nameTextStyle: { color: 'rgba(255,100,130,0.7)', fontSize: 9 },
        axisLine: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '渗透率',
        type: 'bar',
        barWidth: 14,
        yAxisIndex: 0,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(160,120,255,0.9)' },
            { offset: 1, color: 'rgba(160,120,255,0.15)' },
          ]),
        },
        data: permeability,
      },
      {
        name: '孔隙度',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: 'rgba(255,100,130,0.9)' },
        itemStyle: { color: '#ff6482', borderWidth: 0 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,100,130,0.25)' },
            { offset: 1, color: 'rgba(255,100,130,0.02)' },
          ]),
        },
        data: porosity,
      },
    ],
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
  border: 1px solid rgba(160, 120, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  overflow: hidden;
}
.chart-title {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(160, 120, 255);
  border-bottom: 1px solid rgba(160, 120, 255, 0.12);
  background: rgba(160, 120, 255, 0.06);
  letter-spacing: 1px;
  flex-shrink: 0;
}
.chart-body {
  width: 100%;
  flex: 1;
  min-height: 160px;
}
</style>
