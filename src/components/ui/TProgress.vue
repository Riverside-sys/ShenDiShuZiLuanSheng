<script setup lang="ts">
defineProps({
  progress: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="progress-bar">
    <div class="progress-value" :style="{ width: progress + '%' }"></div>
  </div>
</template>

<style scoped lang="less">
.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #252e37;
  overflow: hidden;

  .progress-value {
    height: 100%;
    background: linear-gradient(90deg, #64ab88 3.34%, #92d3af 71.53%, #c5f4d0 99.76%);
  }
}
</style>
