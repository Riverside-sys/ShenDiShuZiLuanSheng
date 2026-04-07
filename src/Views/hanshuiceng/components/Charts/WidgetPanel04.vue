<template>
  <LayoutPanel title="测井约束全波形反演">
    <div class="container">
      <ImagePopup :src="aquiferWellConstrainedInversionImageUrl" />
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import ImagePopup from './ImagePopup.vue'
import { aquiferWellConstrainedInversionImageUrl } from '../../data'
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
