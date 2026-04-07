<template>
  <LayoutPanel title="含水层形成原理演示">
    <div class="video-images">
      <VideoPopup src="/video/含水层形成原理.mp4" />
    </div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import VideoPopup from './VideoPopup.vue'
</script>

<style lang="scss" scoped>
.video-images {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin-top: 10px;
  font-size: 40px;
  color: #fff;
  background-color: rgba(93, 101, 122, 20%);
}
</style>
