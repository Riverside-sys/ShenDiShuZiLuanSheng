<template>
  <LayoutPanel title="单腔储能分析">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from '../LayoutPanel.vue'
import { nextTick, onMounted } from 'vue'
import useEcharts from '@/hooks/useEcharts'

const { container, setOption } = useEcharts()

const generateOptions = () => {
  const data = [
    { value: 12.6, name: '丰储1号' },
    { value: 8.3, name: '瑞盐3号' },
    { value: 15.1, name: '通源5号' },
    { value: 6.8, name: '其他' },
  ]
  const colors = ['#00fea9', '#5bc7fa', '#f1bd49', '#a78bfa']

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: '#17c7fe',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: '{b}: {c} 万m³ ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 5,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      formatter: (name: string) => {
        const item = data.find(d => d.name === name)
        return item ? `${name}  {val|${item.value}}` : name
      },
      textStyle: {
        color: '#b9cfff',
        fontSize: 12,
        rich: {
          val: {
            color: '#17c7fe',
            fontWeight: 'bold',
            fontSize: 14,
          },
        },
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
          formatter: '{total|42.8}\n{unit|万m³}',
          rich: {
            total: {
              fontSize: 22,
              fontWeight: 'bold',
              color: '#17c7fe',
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
          color: 'rgba(23, 199, 254, 0.06)',
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
