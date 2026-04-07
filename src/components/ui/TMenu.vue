<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number]
  },
  menu: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const activeClass = (key) => (key === props.modelValue ? 'is-active' : '')

const handleActive = (key) => {
  if (props.modelValue !== key) {
    emit('update:modelValue', key)
    emit('change', key)
  }
}
</script>

<template>
  <div class="common-menu">
    <div class="common-menu-wrapper">
      <div
        class="common-menu-item"
        :class="activeClass(item.key)"
        v-for="item in menu"
        :key="item.key"
        @click="handleActive(item.key)"
      >
        <div>{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.common-menu {
  background: rgba(14, 30, 49, 0.8);
  position: relative;
  box-shadow: 0 0 20px 0 rgba(23, 199, 254, 0.5) inset;
  &:before {
    content: ' ';
    width: 10px;
    height: 10px;
    position: absolute;
    top: -1px;
    left: -1px;
    border-top: 2px solid #17c7fe;
    border-left: 2px solid #17c7fe;
  }
  &:after {
    content: ' ';
    width: 10px;
    height: 10px;
    position: absolute;
    top: -1px;
    right: -1px;
    border-top: 2px solid #17c7fe;
    border-right: 2px solid #17c7fe;
  }
  .common-menu-wrapper {
    width: 100%;
    height: 100%;
    padding: 20px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 13px;
    .common-menu-item {
      position: relative;
      cursor: pointer;
      width: 100%;
      text-align: center;
      font-family: YouSheBiaoTiHei;
      font-size: 20px;
      padding: 5px 10px;
      letter-spacing: 1.6px;
      background: linear-gradient(
        to right,
        transparent 0%,
        rgba(23, 199, 254, 0.5) 50%,
        transparent 100%
      );
      &.is-active {
        color: #17c7fe;
      }
      &:before,
      &:after {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        content: ' ';
        width: 15px;
        height: 10px;
        background: url('@/assets/svgs/point.svg') no-repeat center center;
        background-size: cover;
      }
      &:before {
        left: 10px;
      }
      &:after {
        right: 10px;
      }
    }
    &:before {
      content: ' ';
      width: 10px;
      height: 10px;
      position: absolute;
      bottom: -1px;
      left: -1px;
      border-bottom: 2px solid #17c7fe;
      border-left: 2px solid #17c7fe;
    }
    &:after {
      content: ' ';
      width: 10px;
      height: 10px;
      position: absolute;
      bottom: -1px;
      right: -1px;
      border-bottom: 2px solid #17c7fe;
      border-right: 2px solid #17c7fe;
    }
  }
}
</style>
