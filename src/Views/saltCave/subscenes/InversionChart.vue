<template><div ref="host" class="chart" /></template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import * as echarts from "echarts";
const props = defineProps<{ option: echarts.EChartsOption }>();
const host = ref<HTMLDivElement>();
let chart: echarts.ECharts | undefined;
let observer: ResizeObserver;
onMounted(() => {
  chart = echarts.init(host.value!);
  chart.setOption(props.option);
  observer = new ResizeObserver(() => chart?.resize());
  observer.observe(host.value!);
});
watch(
  () => props.option,
  (option) => chart?.setOption(option, true),
);
onBeforeUnmount(() => {
  observer?.disconnect();
  chart?.dispose();
});
</script>
<style scoped>
.chart {
  width: 100%;
  height: 156px;
  min-height: 0;
}
</style>
