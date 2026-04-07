<template>
  <LayoutPanel title="视频监控">
    <div class="video-images">
      <video src="/video/573240324-1-16.mp4" autoplay muted loop></video>
    </div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}

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

  video {
    width: 100%;
    height: 100%;
  }
}
</style>
