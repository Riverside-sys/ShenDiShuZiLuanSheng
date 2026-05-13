<template>
  <LayoutPanel title="巷道环境监测">
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

let methaneData = seedData(0.45, 0.2)
let coData = seedData(15, 6)
let tempData = seedData(23, 3)

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
  yAxis: {
    type: 'value',
    axisLabel: { color: '#9ec5e0', fontSize: 11 },
    splitLine: { lineStyle: { color: '#c8c8c820', type: 'dashed' } },
  },
  series: [
    {
      name: '瓦斯 (%)',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: methaneData,
      lineStyle: { width: 2, color: '#65f6c5' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(101, 246, 197, 0.4)' },
          { offset: 1, color: 'rgba(101, 246, 197, 0)' },
        ]),
      },
    },
    {
      name: 'CO (ppm)',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: coData,
      lineStyle: { width: 2, color: '#5fc8ff' },
    },
    {
      name: '温度 (℃)',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: tempData,
      lineStyle: { width: 2, color: '#f1bd49' },
    },
  ],
})

let timer: number | null = null

onMounted(() => {
  nextTick(() => {
    setOption(buildOption())
    timer = window.setInterval(() => {
      methaneData = [...methaneData.slice(1), +(0.45 + (Math.random() - 0.5) * 0.2).toFixed(2)]
      coData = [...coData.slice(1), +(15 + (Math.random() - 0.5) * 6).toFixed(2)]
      tempData = [...tempData.slice(1), +(23 + (Math.random() - 0.5) * 3).toFixed(2)]
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
