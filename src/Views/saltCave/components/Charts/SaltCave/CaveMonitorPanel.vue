<template>
  <LayoutPanel title="盐穴运行监测">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from '../LayoutPanel.vue'
import { nextTick, onMounted, onBeforeUnmount } from 'vue'
import useEcharts from '@/hooks/useEcharts'

const { container, echarts, setOption } = useEcharts()

const xData = Array.from({ length: 12 }, (_, i) =>
  `${(8 + i).toString().padStart(2, '0')}:00`
)

const seedData = (base: number, jitter: number) =>
  Array.from({ length: xData.length }, () => +(base + (Math.random() - 0.5) * jitter).toFixed(2))

let pressureData = seedData(18.5, 2)
let temperatureData = seedData(28, 3)
let stabilityData = seedData(95, 5)

const buildOption = () => ({
  legend: {
    show: true,
    right: 0,
    textStyle: { color: '#cfeaff', fontSize: 12 },
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#000',
    borderColor: '#333',
    textStyle: { color: '#fff' },
  },
  grid: { left: '4%', right: '5%', bottom: '4%', top: '20%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: xData,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#9ec5e0', fontSize: 11 },
  },
  yAxis: [
    {
      type: 'value',
      name: '压力 MPa',
      axisLabel: { color: '#9ec5e0', fontSize: 11 },
      splitLine: { lineStyle: { color: '#c8c8c820', type: 'dashed' } },
    },
    {
      type: 'value',
      name: '温度 ℃',
      axisLabel: { color: '#9ec5e0', fontSize: 11 },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '腔内压力',
      type: 'line',
      smooth: true,
      symbol: 'none',
      yAxisIndex: 0,
      data: pressureData,
      lineStyle: { width: 2, color: '#5bc7fa' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(91, 199, 250, 0.4)' },
          { offset: 1, color: 'rgba(91, 199, 250, 0)' },
        ]),
      },
    },
    {
      name: '温度',
      type: 'line',
      smooth: true,
      symbol: 'none',
      yAxisIndex: 1,
      data: temperatureData,
      lineStyle: { width: 2, color: '#f1bd49' },
    },
    {
      name: '稳定性指数',
      type: 'line',
      smooth: true,
      symbol: 'none',
      yAxisIndex: 1,
      data: stabilityData,
      lineStyle: { width: 2, color: '#65f6c5' },
    },
  ],
})

let timer: number | null = null

onMounted(() => {
  nextTick(() => {
    setOption(buildOption())
    timer = window.setInterval(() => {
      pressureData = [...pressureData.slice(1), +(18.5 + (Math.random() - 0.5) * 2).toFixed(2)]
      temperatureData = [...temperatureData.slice(1), +(28 + (Math.random() - 0.5) * 3).toFixed(2)]
      stabilityData = [...stabilityData.slice(1), +(95 + (Math.random() - 0.5) * 5).toFixed(2)]
      setOption(buildOption())
    }, 3000)
  })
})

onBeforeUnmount(() => {
  if (timer != null) {
    window.clearInterval(timer)
    timer = null
  }
})
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>