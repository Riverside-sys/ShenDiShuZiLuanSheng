<template>
  <LayoutPanel title="蠕变监测分析">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from '../LayoutPanel.vue'
import { nextTick, onMounted, onBeforeUnmount } from 'vue'
import useEcharts from '@/hooks/useEcharts'

const { container, echarts, setOption } = useEcharts()

const xData = Array.from({ length: 10 }, (_, i) => `第${i + 1}年`)

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
    data: xData,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#9ec5e0', fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    name: '蠕变率 %/年',
    axisLabel: { color: '#9ec5e0', fontSize: 11 },
    splitLine: { lineStyle: { color: '#c8c8c820', type: 'dashed' } },
  },
  series: [
    {
      name: '丰储1号',
      type: 'bar',
      data: [0.032, 0.031, 0.033, 0.030, 0.034, 0.032, 0.031, 0.033, 0.032, 0.031],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#00fea9' },
          { offset: 1, color: 'rgba(0, 254, 169, 0.3)' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '35%',
    },
    {
      name: '瑞盐3号',
      type: 'bar',
      data: [0.025, 0.026, 0.024, 0.027, 0.025, 0.026, 0.025, 0.024, 0.026, 0.025],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#5bc7fa' },
          { offset: 1, color: 'rgba(91, 199, 250, 0.3)' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '35%',
    },
    {
      name: '通源5号',
      type: 'bar',
      data: [0.041, 0.040, 0.042, 0.039, 0.041, 0.040, 0.042, 0.041, 0.039, 0.042],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#f1bd49' },
          { offset: 1, color: 'rgba(241, 189, 73, 0.3)' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '35%',
    },
  ],
})

onMounted(() => {
  nextTick(() => {
    setOption(buildOption())
  })
})
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>