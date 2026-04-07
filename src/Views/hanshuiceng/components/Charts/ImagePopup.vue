<template>
  <div class="image-popup-trigger" @click="openModal">
    <img :src="src" :alt="alt" class="trigger-img" />
    <div class="hover-mask">
      <div class="magnifier-icon"></div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="image-popup-modal" @click.self="closeModal">
        <div class="modal-content">
          <div class="close-btn" @click="closeModal">×</div>
          <img :src="src" :alt="alt" class="modal-img" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  src: string;
  alt?: string;
}>();

const visible = ref(false);

const openModal = () => {
  visible.value = true;
};

const closeModal = () => {
  visible.value = false;
};
</script>

<style scoped lang="scss">
.image-popup-trigger {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: zoom-in;
  overflow: hidden;
  border-radius: 4px;
  pointer-events: auto;
  /* 关键修复：允许接收鼠标事件 */

  .trigger-img {
    width: 100%;
    height: 100%;
    object-fit: fill;
    /* 保持原有的填充方式，或者 contain/cover */
    transition: transform 0.3s ease;
  }

  .hover-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    .magnifier-icon {
      width: 40px;
      height: 40px;
      border: 3px solid #fff;
      border-radius: 50%;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        width: 12px;
        height: 3px;
        background: #fff;
        bottom: -2px;
        right: -8px;
        transform: rotate(45deg);
      }
    }
  }

  &:hover {
    .trigger-img {
      transform: scale(1.1);
    }

    .hover-mask {
      opacity: 1;
    }
  }
}

.image-popup-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    animation: zoomIn 0.3s ease;

    .close-btn {
      position: absolute;
      top: -40px;
      right: -40px;
      width: 36px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      color: #fff;
      font-size: 30px;
      cursor: pointer;
      border: 2px solid #fff;
      border-radius: 50%;
      transition: all 0.3s;
      background: rgba(0, 0, 0, 0.5);

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
      }
    }

    .modal-img {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
