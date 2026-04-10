<template>
  <div class="layout-footer">
    <div class="item" @click="handleReset">
      重置视图
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['resetView'])

const handleReset = () => {
  emit('resetView')
}
</script>

<style lang="scss" scoped>
.layout-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 900px;
  height: 100px;
  background-image: url('@/assets/dianchang/footer_bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center bottom;
  pointer-events: auto;
  padding-bottom: 10px;
  gap: 20px;

  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 140px;
    height: 50px;
    font-family: Douyu;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    background-image: url('@/assets/dianchang/footer_item_bg.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    transition: all 0.3s;

    &:hover {
      filter: brightness(1.2);
      transform: translateY(-2px);
    }
  }
}
</style>
