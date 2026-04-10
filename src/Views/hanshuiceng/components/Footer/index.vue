<template>
  <div class="layout-footer">
    <div class="item" @click="handleVelocityModelShow">
      速度模型动图
    </div>
    <div class="item" @click="handleInversionShow">
      反演结果展示
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['velocityModelShow', 'inversionShow']);

const handleVelocityModelShow = () => {
  emit('velocityModelShow');
};

const handleInversionShow = () => {
  emit('inversionShow');
};
</script>

<style lang="scss" scoped>
.layout-footer {
  /* 移除绝对定位，因为外层父容器已经定位好了 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 900px;
  /* 自适应宽度，由内容撑开，避免过宽遮挡左右面板 */
  /* min-width: 600px; */
  /* 给一个最小宽度保持美观 */
  /* max-width: 900px; */
  /* 限制最大宽度，确保不覆盖左右侧面板 (1920 - 474*2 ≈ 970) */
  height: 100px;
  /* 根据背景图调整高度 */
  background-image: url('@/assets/dianchang/footer_bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center bottom;
  pointer-events: auto;
  /* 确保自身及子元素可点击 */
  padding-bottom: 10px;
  gap: 20px;
  /* 按钮之间的间距 */

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
