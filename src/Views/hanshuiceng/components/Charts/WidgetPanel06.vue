<template>
  <LayoutPanel title="全波形反演">
    <div class="container">
      <ImagePopup :src="aquiferFullWaveformInversionImageUrl" />
    </div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import ImagePopup from './ImagePopup.vue'
import { aquiferFullWaveformInversionImageUrl } from '../../data'
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
