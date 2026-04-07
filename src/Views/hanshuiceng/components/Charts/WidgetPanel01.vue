<template>
  <LayoutPanel title="含水层2D分析">
    <div class="container">
      <ImagePopup :src="aquifer2DAnalysisImageUrl" />
    </div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import ImagePopup from './ImagePopup.vue'
import { aquifer2DAnalysisImageUrl } from '../../data'
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
