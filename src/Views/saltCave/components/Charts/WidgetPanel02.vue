<template>
  <LayoutPanel title="腔体压力与温度监测">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import { nextTick, onMounted } from 'vue'
import useEcharts from '@/hooks/useEcharts'

const { container, echarts, setOption } = useEcharts()

const generateOptions = () => {
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: '#17c7fe',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 12 },
    },
    legend: {
      right: 0,
      top: 0,
      textStyle: { color: '#b9cfff', fontSize: 11 },
      itemWidth: 12,
      itemHeight: 4,
    },
    grid: {
      left: '2%',
      right: '4%',
      bottom: '2%',
      top: '18%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(91,199,250,0.3)' } },
      axisTick: { show: false },
      axisLabel: { color: '#7eb7d4', fontSize: 11 },
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    },
    yAxis: [
      {
        type: 'value',
        name: 'MPa',
        nameTextStyle: { color: '#7eb7d4', fontSize: 10 },
        axisLabel: { color: '#7eb7d4', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(91,199,250,0.1)', type: 'dashed' } },
        axisLine: { show: false },
      },
      {
        type: 'value',
        name: '℃',
        nameTextStyle: { color: '#7eb7d4', fontSize: 10 },
        axisLabel: { color: '#7eb7d4', fontSize: 11 },
        splitLine: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        name: '腔体压力',
        type: 'line',
        yAxisIndex: 0,
        symbol: 'circle',
        symbolSize: 6,
        smooth: true,
        lineStyle: { width: 2, color: '#00fea9', shadowColor: 'rgba(0,254,169,0.5)', shadowBlur: 10 },
        itemStyle: { color: '#00fea9', borderColor: '#fff', borderWidth: 1 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 254, 169, 0.35)' },
            { offset: 1, color: 'rgba(0, 254, 169, 0.02)' },
          ]),
        },
        data: [8.2, 8.5, 9.1, 10.3, 9.8, 9.2, 8.6],
      },
      {
        name: '注气速率',
        type: 'line',
        yAxisIndex: 0,
        symbol: 'diamond',
        symbolSize: 6,
        smooth: true,
        lineStyle: { width: 2, color: '#5bc7fa', shadowColor: 'rgba(91,199,250,0.5)', shadowBlur: 10 },
        itemStyle: { color: '#5bc7fa', borderColor: '#fff', borderWidth: 1 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(91, 199, 250, 0.25)' },
            { offset: 1, color: 'rgba(91, 199, 250, 0.02)' },
          ]),
        },
        data: [1.2, 0.8, 2.5, 3.1, 2.8, 1.5, 0.9],
      },
      {
        name: '腔内温度',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'triangle',
        symbolSize: 6,
        smooth: true,
        lineStyle: { width: 2, color: '#f1bd49', shadowColor: 'rgba(241,189,73,0.5)', shadowBlur: 10 },
        itemStyle: { color: '#f1bd49', borderColor: '#fff', borderWidth: 1 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(241, 189, 73, 0.2)' },
            { offset: 1, color: 'rgba(241, 189, 73, 0.02)' },
          ]),
        },
        data: [42, 41, 43, 46, 48, 45, 43],
      },
    ],
  }
}

onMounted(() => {
  nextTick(() => {
    setOption(generateOptions())
  })
})
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
