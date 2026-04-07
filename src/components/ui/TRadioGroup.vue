<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  modelValue: {
    type: String
  },
  options: {
    type: Array,
    default: () => []
  },
  size: {
    type: String,
    default: 'medium'
  }
})
const emit = defineEmits(['update:modelValue', 'change'])

// 计算激活的类
const activeClass = (itemValue) => (itemValue === props.modelValue ? 'is-active' : '')

// 用于改变value的方法
const changeValue = (newValue) => {
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const styles = computed(() => {
  if (props.size === 'small') {
    return {
      width: `${Math.round(80 * 0.6)}px`,
      height: `${Math.round(32 * 0.6)}px`,
      lineHeight: `${Math.round(32 * 0.6)}px`,
      fontSize: '13px'
    }
  }
  if (props.size === 'large') {
    return {
      width: `${Math.round(80 * 1.2)}px`,
      height: `${Math.round(32 * 1.2)}px`,
      lineHeight: `${Math.round(32 * 1.2)}px`
    }
  }
  return {
    width: `80px`,
    height: `32px`
  }
})
</script>
<template>
  <div class="t-radio-group">
    <div
      class="t-radio-group-item"
      :style="{ ...styles }"
      :class="activeClass(item.value)"
      v-for="item in options"
      :key="item.value"
      @click="changeValue(item.value)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<style scoped lang="less">
.t-radio-group {
  display: flex;
  .t-radio-group-item {
    text-align: center;
    width: 80px;
    height: 32px;
    line-height: 32px;
    color: #fff;
    font-family: 'Alibaba PuHuiTi';
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 2px;
    cursor: pointer;
    background: url('@/assets/svgs/radio_bg.svg') no-repeat center center;
    background-size: contain;
    &:hover {
      color: #58ddfa;
    }

    &.is-active {
      background: url('@/assets/svgs/radio_active.bg.svg') no-repeat center center;
      background-size: contain;
    }
  }
}
</style>
