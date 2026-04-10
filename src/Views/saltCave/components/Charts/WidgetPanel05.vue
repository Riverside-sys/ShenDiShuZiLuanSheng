<template>
  <LayoutPanel title="盐穴稳定性评估">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import { nextTick, onMounted } from 'vue'
import useEcharts from '@/hooks/useEcharts'

const { container, echarts, setOption } = useEcharts()

const generateOptions = () => {
  const indicators = [
    { name: '收敛速率', max: 100 },
    { name: '蠕变控制', max: 100 },
    { name: '顶板稳定', max: 100 },
    { name: '密封完整', max: 100 },
    { name: '微震监测', max: 100 },
    { name: '围岩强度', max: 100 },
  ]

  return {
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: '#17c7fe',
      borderWidth: 1,
      textStyle: { color: '#fff' },
    },
    radar: {
      indicator: indicators,
      center: ['50%', '55%'],
      radius: '68%',
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#b9cfff',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(91, 199, 250, 0.15)',
        },
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(91, 199, 250, 0.04)', 'rgba(91, 199, 250, 0.08)'],
        },
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(91, 199, 250, 0.2)',
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [92, 87, 95, 89, 78, 91],
            name: '当前评分',
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 2,
              color: '#00fea9',
              shadowColor: 'rgba(0, 254, 169, 0.5)',
              shadowBlur: 10,
            },
            itemStyle: {
              color: '#00fea9',
              borderColor: '#fff',
              borderWidth: 1,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 254, 169, 0.4)' },
                { offset: 1, color: 'rgba(0, 254, 169, 0.05)' },
              ]),
            },
          },
          {
            value: [85, 80, 88, 82, 70, 85],
            name: '上月评分',
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: {
              width: 1,
              color: '#5bc7fa',
              type: 'dashed',
            },
            itemStyle: {
              color: '#5bc7fa',
            },
            areaStyle: {
              color: 'rgba(91, 199, 250, 0.08)',
            },
          },
        ],
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
