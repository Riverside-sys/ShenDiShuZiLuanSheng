<template>
  <LayoutPanel title="风险告警分布">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from '../LayoutPanel.vue'
import { nextTick, onMounted } from 'vue'
import useEcharts from '@/hooks/useEcharts'

const { container, echarts, setOption } = useEcharts()

const buildOption = () => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: '#000',
    borderColor: '#333',
    textStyle: { color: '#fff' },
  },
  legend: {
    top: 'middle',
    right: 6,
    orient: 'vertical',
    textStyle: { color: '#cfeaff', fontSize: 12 },
    itemWidth: 10,
    itemHeight: 10,
  },
  series: [
    {
      name: '告警类型',
      type: 'pie',
      radius: ['44%', '70%'],
      center: ['38%', '52%'],
      avoidLabelOverlap: true,
      label: {
        show: true,
        color: '#cfeaff',
        fontSize: 11,
        formatter: '{b}\n{d}%',
      },
      labelLine: { length: 8, length2: 8, lineStyle: { color: '#5fc8ff' } },
      itemStyle: {
        borderColor: '#06121f',
        borderWidth: 2,
      },
      data: [
        { value: 12, name: '瓦斯超限', itemStyle: { color: '#65f6c5' } },
        { value: 6, name: '设备故障', itemStyle: { color: '#5fc8ff' } },
        { value: 4, name: '人员越界', itemStyle: { color: '#f1bd49' } },
        { value: 3, name: '通风异常', itemStyle: { color: '#a08bff' } },
        { value: 2, name: '其他', itemStyle: { color: '#ff6b6b' } },
      ],
    },
  ],
})

void echarts

onMounted(() => {
  nextTick(() => setOption(buildOption()))
})
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
