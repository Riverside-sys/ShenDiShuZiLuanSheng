<template>
  <LayoutPanel title="点云采集质量">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from '../LayoutPanel.vue'
import { nextTick, onMounted, watch } from 'vue'
import useEcharts from '@/hooks/useEcharts'

interface SegmentInfo {
  id: number
  name: string
  loaded: boolean
  qualityScore: number
}

const props = defineProps<{
  segments: SegmentInfo[]
}>()

const { container, echarts, setOption } = useEcharts()

const buildOption = () => {
  const xData = props.segments.map((s) => s.id.toString().padStart(2, '0'))
  const baseQuality = [78, 82, 75, 88, 80, 91, 84, 79, 86, 82, 90]
  const data = props.segments.map((s, i) => (s.loaded ? s.qualityScore : baseQuality[i] ?? 80))

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#000',
      borderColor: '#333',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        const p = params[0]
        return `${p.axisValue} 段<br/>质量评分：${p.value}`
      },
    },
    grid: { left: '6%', right: '5%', bottom: '4%', top: '18%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ec5e0', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#9ec5e0', fontSize: 11 },
      splitLine: { lineStyle: { color: '#c8c8c820', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        data,
        itemStyle: {
          borderRadius: [2, 2, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(101, 246, 197, 1)' },
            { offset: 1, color: 'rgba(95, 200, 255, 0.2)' },
          ]),
        },
        markLine: {
          symbol: 'none',
          lineStyle: { color: '#f1bd49', type: 'dashed' },
          data: [{ yAxis: 80, label: { color: '#f1bd49', formatter: '合格线 80' } }],
        },
      },
    ],
  }
}

onMounted(() => {
  nextTick(() => setOption(buildOption()))
})

watch(
  () => props.segments.map((s) => `${s.loaded}-${s.qualityScore}`).join(','),
  () => {
    setOption(buildOption())
  }
)
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
