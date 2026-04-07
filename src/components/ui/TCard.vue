<script setup lang="ts">
import { useSlots } from 'vue'

defineProps({
  title: {
    type: String,
    required: false
  },
  headStyle: {
    type: Object,
    default: () => {}
  },
  bodyStyle: {
    type: Object,
    default: () => {}
  }
})
const slots = useSlots()
</script>

<template>
  <div class="t-card">
    <div
      v-if="title || slots['title'] || slots['extra']"
      class="t-card-header"
      :style="{ ...headStyle }"
    >
      <div class="t-card-header__inner flex justify-between">
        <div class="t-card-header-text" v-if="title || slots['title']">
          <div v-if="title && !slots['title']">{{ title }}</div>
          <slot v-if="slots['title']" name="title"></slot>
        </div>
        <slot name="extra"></slot>
      </div>
    </div>
    <div class="t-card-body" :style="{ ...bodyStyle }">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="less">
.t-card {
  width: 100%;

  .t-card-header {
    width: 100%;
    height: 48px;
    line-height: 42px;
    background: url('@/assets/svgs/card_head_bg.svg') no-repeat left center;
    background-size: contain;
    padding-left: 20px;
    .t-card-header__inner {
      font-family: YouSheBiaoTiHei;
      font-size: 32px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 3.2px;
      .t-card-header-text {
        background: linear-gradient(180deg, #eff7ff 13.05%, #93deff 84.37%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }

  .t-card-body {
    white-space: wrap;
    padding: 10px;
  }
}
</style>
