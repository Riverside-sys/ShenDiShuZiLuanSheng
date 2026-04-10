<template>
  <LayoutPanel title="月度注采量统计">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import { nextTick, onMounted } from 'vue'
import useEcharts from '@/hooks/useEcharts'

const { container, echarts, setOption } = useEcharts()

const generateOptions = () => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  const injectData = [520, 480, 610, 580, 640, 550]
  const extractData = [380, 420, 450, 510, 470, 490]

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: '#17c7fe',
      borderWidth: 1,
      textStyle: { color: '#fff' },
    },
    legend: {
      right: 0,
      top: 0,
      textStyle: { color: '#b9cfff', fontSize: 11 },
      itemWidth: 14,
      itemHeight: 8,
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
      axisLine: { lineStyle: { color: 'rgba(91,199,250,0.3)' } },
      axisTick: { show: false },
      axisLabel: { color: '#7eb7d4', fontSize: 11 },
      data: months,
    },
    yAxis: {
      type: 'value',
      name: '万m³',
      nameTextStyle: { color: '#7eb7d4', fontSize: 10 },
      axisLabel: { color: '#7eb7d4', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(91,199,250,0.1)', type: 'dashed' } },
      axisLine: { show: false },
    },
    series: [
      {
        name: '注入量',
        type: 'bar',
        barWidth: 16,
        barGap: '30%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00fea9' },
            { offset: 0.5, color: 'rgba(0, 254, 169, 0.5)' },
            { offset: 1, color: 'rgba(0, 254, 169, 0.08)' },
          ]),
        },
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(0, 254, 169, 0.5)',
            shadowBlur: 15,
          },
        },
        data: injectData,
      },
      {
        name: '采出量',
        type: 'bar',
        barWidth: 16,
        barGap: '30%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#5bc7fa' },
            { offset: 0.5, color: 'rgba(91, 199, 250, 0.5)' },
            { offset: 1, color: 'rgba(91, 199, 250, 0.08)' },
          ]),
        },
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(91, 199, 250, 0.5)',
            shadowBlur: 15,
          },
        },
        data: extractData,
      },
      {
        name: '库存趋势',
        type: 'line',
        symbol: 'circle',
        symbolSize: 6,
        smooth: true,
        lineStyle: { width: 2, color: '#f1bd49', type: 'dashed' },
        itemStyle: { color: '#f1bd49' },
        data: injectData.map((v, i) => v - extractData[i]),
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
