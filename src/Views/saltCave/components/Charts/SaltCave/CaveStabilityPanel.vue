<template>
  <LayoutPanel title="稳定性评价">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from '../LayoutPanel.vue'
import { nextTick, onMounted } from 'vue'
import useEcharts from '@/hooks/useEcharts'

const { container, echarts, setOption } = useEcharts()

const generateOptions = () => {
  const data = [
    { value: 85, name: '优秀' },
    { value: 10, name: '良好' },
    { value: 4, name: '一般' },
    { value: 1, name: '较差' },
  ]
  const colors = ['#00fea9', '#5bc7fa', '#f1bd49', '#ff6b6b']

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: '#17c7fe',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: '{b}: {c}%',
    },
    legend: {
      orient: 'vertical',
      right: 5,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: {
        color: '#b9cfff',
        fontSize: 12,
      },
    },
    color: colors,
    series: [
      {
        type: 'pie',
        radius: ['30%', '55%'],
        center: ['32%', '50%'],
        roseType: 'area',
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: 'rgba(10, 22, 40, 0.6)',
          borderWidth: 3,
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 30,
            shadowColor: 'rgba(23, 199, 254, 0.5)',
          },
        },
        data,
      },
      {
        type: 'pie',
        radius: ['58%', '62%'],
        center: ['32%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        silent: true,
        itemStyle: {
          color: 'rgba(91, 199, 250, 0.15)',
        },
        data: [{ value: 1 }],
      },
      {
        type: 'pie',
        radius: ['0%', '25%'],
        center: ['32%', '50%'],
        label: {
          show: true,
          position: 'center',
          formatter: '{total|85}\n{unit|优秀}',
          rich: {
            total: {
              fontSize: 22,
              fontWeight: 'bold',
              color: '#00fea9',
              lineHeight: 28,
            },
            unit: {
              fontSize: 11,
              color: '#7eb7d4',
            },
          },
        },
        labelLine: { show: false },
        silent: true,
        itemStyle: {
          color: 'rgba(0, 254, 169, 0.06)',
        },
        data: [{ value: 1 }],
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