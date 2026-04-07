<template>
  <LayoutPanel title="矿区环境监测趋势">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import { nextTick, onMounted } from 'vue'
import { sampleSize, range } from 'lodash'
import useEcharts from '@/hooks/useEcharts'

const { container, echarts, setOption } = useEcharts()

const generateOptions = (sources: any[][]) => {
  return {
    legend: {
      show: true,
      right: 0,
      textStyle: {
        color: '#fff',
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#000',
      borderColor: '#333',
      textStyle: {
        color: '#fff',
      },
    },
    grid: {
      left: '1%',
      right: '6%',
      bottom: '0%',
      top: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#fff',
        margin: 20,
      },
      data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#c8c8c8',
      },
      splitLine: {
        lineStyle: {
          color: '#c8c8c830',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '瓦斯浓度(%)',
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          width: 2,
          color: 'rgba(0, 254, 169, 1)',
        },
        itemStyle: {
          color: 'rgba(0, 254, 169, 0.5)',
        },
        // areaStyle: {},
        data: sources[0],
      },
      {
        name: '一氧化碳(ppm)',
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          width: 2,
          color: 'rgba(87, 153, 214, 1)',
        },
        itemStyle: {
          color: 'rgba(87, 153, 214, 0.5)',
        },
        // areaStyle: {},
        data: sources[1],
      },
      {
        name: '温度(℃)',
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          width: 2,
          color: 'rgba(241, 189, 73, 1)',
        },
        itemStyle: {
          color: 'rgba(241, 189, 73, 0.5)',
        },
        // areaStyle: {},
        data: sources[2],
      },
    ],
  }
}

onMounted(() => {
  nextTick(() => {
    const sources = [
      [0.4, 0.5, 0.45, 0.6, 0.55, 0.48, 0.52], // 瓦斯浓度 (%)
      [12, 15, 13, 18, 14, 16, 15],            // 一氧化碳 (ppm)
      [22, 24, 25, 26, 25, 23, 21],            // 温度 (℃)
    ]
    const options = generateOptions(sources)
    setOption(options)
  })
})
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
