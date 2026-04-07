<template>
  <div class="image-preview-overlay" v-if="visible" @click.self="closePopup">
    <div class="image-preview-popup">
      <div class="popup-header">
        <h3>{{ title }}</h3>
        <button class="preview-close-btn" @click="closePopup">×</button>
      </div>

      <div class="popup-content">
        <img :src="src" :alt="title" class="preview-img" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const title = ref('');
const src = ref('');

const open = (imgSrc: string, imgTitle: string = '预览') => {
  src.value = imgSrc;
  title.value = imgTitle;
  visible.value = true;
};

const closePopup = () => {
  visible.value = false;
};

defineExpose({
  open
});
</script>

<style scoped lang="scss">
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.image-preview-popup {
  width: auto;
  max-width: 90vw;
  max-height: 90vh;
  background: rgba(16, 29, 41, 0.95);
  border: 1px solid rgba(23, 199, 254, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  padding: 20px;
  animation: zoomIn 0.3s ease;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(23, 199, 254, 0.2);
  padding-bottom: 10px;
  flex-shrink: 0;
  min-width: 300px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #17c7fe;
    font-weight: 500;
  }

  .preview-close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #17c7fe;
    cursor: pointer;
    line-height: 1;
    padding: 0 5px;

    &:hover {
      color: #fff;
    }
  }
}

.popup-content {
  overflow: auto;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  .preview-img {
    max-width: 100%;
    max-height: calc(90vh - 80px);
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

