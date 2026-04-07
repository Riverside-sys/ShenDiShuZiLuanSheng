<template>
  <LayoutPanel title="三维盖帽状透镜体水层速度模型">
    <div class="container">
      <ImagePopup :src="aquiferVelocityModelImageUrl" />
    </div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import ImagePopup from './ImagePopup.vue'
import { aquiferVelocityModelImageUrl } from '../../data'


</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
