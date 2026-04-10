<template>
  <LayoutPanel title="盐穴储能概览">
    <div class="liquid-row">
      <div v-for="(item, idx) in metrics" :key="idx" class="liquid-item">
        <div class="chart-box" :ref="(el) => setChartRef(el as HTMLElement, idx)"></div>
        <div class="label">{{ item.label }}</div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import { onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import 'echarts-liquidfill'

const metrics = [
  { label: '储能利用率', value: 0.78, color: ['#00fea9', '#0ba360'] },
  { label: '氢气纯度', value: 0.92, color: ['#5bc7fa', '#3a7bd5'] },
  { label: '运行效率', value: 0.85, color: ['#f1bd49', '#ee9ca7'] },
]

const charts: (echarts.ECharts | null)[] = []
const containers: (HTMLElement | null)[] = [null, null, null]

const setChartRef = (el: HTMLElement | null, idx: number) => {
  containers[idx] = el
}

const initCharts = () => {
  metrics.forEach((item, idx) => {
    const el = containers[idx]
    if (!el) return
    const chart = echarts.init(el)
    charts[idx] = chart
    chart.setOption({
      series: [{
        type: 'liquidFill',
        radius: '80%',
        center: ['50%', '50%'],
        data: [item.value, item.value - 0.1, item.value - 0.2],
        color: item.color,
        backgroundStyle: {
          color: 'rgba(10, 22, 40, 0.8)',
          borderColor: item.color[0],
          borderWidth: 2,
        },
        outline: {
          show: true,
          borderDistance: 4,
          itemStyle: {
            borderColor: item.color[0],
            borderWidth: 2,
          },
        },
        label: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#fff',
          formatter: (param: any) => `${(param.value * 100).toFixed(0)}%`,
        },
      }],
    })
  })
}

const handleResize = () => {
  charts.forEach(c => c?.resize())
}

onMounted(() => {
  nextTick(() => {
    initCharts()
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c?.dispose())
})
</script>

<style lang="scss" scoped>
.liquid-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;
  padding-top: 5px;

  .liquid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;

    .chart-box {
      width: 130px;
      height: 130px;
    }

    .label {
      margin-top: 4px;
      font-size: 13px;
      color: #b9cfff;
      text-align: center;
    }
  }
}
</style>
