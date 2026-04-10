<template>
  <div class="chart-card">
    <div class="chart-title">地层水文参数雷达图</div>
    <div ref="chartRef" class="chart-body"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: {
      backgroundColor: 'rgba(8,18,32,0.9)',
      borderColor: 'rgba(23,199,254,0.3)',
      textStyle: { color: '#e0f4ff', fontSize: 11 },
    },
    legend: {
      bottom: 2,
      textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
      itemWidth: 12,
      itemHeight: 3,
    },
    radar: {
      center: ['50%', '46%'],
      radius: '58%',
      indicator: [
        { name: '孔隙度', max: 30 },
        { name: '渗透率', max: 300 },
        { name: '含水率', max: 40 },
        { name: '密度', max: 4 },
        { name: '弹性模量', max: 50 },
        { name: '压缩系数', max: 1 },
      ],
      axisName: { color: 'rgba(255,255,255,0.55)', fontSize: 10 },
      splitArea: {
        areaStyle: {
          color: [
            'rgba(23,199,254,0.02)',
            'rgba(23,199,254,0.04)',
            'rgba(23,199,254,0.06)',
            'rgba(23,199,254,0.08)',
            'rgba(23,199,254,0.10)',
          ],
        },
      },
      axisLine: { lineStyle: { color: 'rgba(23,199,254,0.15)' } },
      splitLine: { lineStyle: { color: 'rgba(23,199,254,0.12)' } },
    },
    series: [{
      type: 'radar',
      data: [
        {
          name: '粉砂层',
          value: [18.5, 180, 22.3, 2.65, 32, 0.45],
          lineStyle: { color: 'rgba(23,199,254,0.9)', width: 2 },
          areaStyle: { color: 'rgba(23,199,254,0.2)' },
          itemStyle: { color: '#17c7fe' },
        },
        {
          name: '细沙层',
          value: [24.2, 250, 30.1, 2.12, 18, 0.72],
          lineStyle: { color: 'rgba(0,230,180,0.9)', width: 2 },
          areaStyle: { color: 'rgba(0,230,180,0.2)' },
          itemStyle: { color: '#00e6b4' },
        },
        {
          name: '粉质黏土',
          value: [8.3, 20, 35.6, 3.1, 45, 0.18],
          lineStyle: { color: 'rgba(255,170,50,0.9)', width: 2 },
          areaStyle: { color: 'rgba(255,170,50,0.2)' },
          itemStyle: { color: '#ffaa32' },
        },
      ],
    }],
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
  color: #00e6b4;
  border-bottom: 1px solid rgba(0, 230, 180, 0.12);
  background: rgba(0, 230, 180, 0.06);
  letter-spacing: 1px;
  flex-shrink: 0;
}
.chart-body {
  width: 100%;
  flex: 1;
  min-height: 160px;
}
</style>
