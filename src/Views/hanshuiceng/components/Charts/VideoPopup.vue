<template>
  <div class="video-popup-trigger" @click="openModal" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <video ref="triggerVideoRef" :src="src" class="trigger-video" muted loop playsinline></video>
    <div class="hover-mask">
      <div class="play-icon-circle">
        <div class="play-icon"></div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="video-popup-modal" @click.self="closeModal">
        <div class="modal-content">
          <div class="close-btn" @click="closeModal">×</div>
          <video :src="src" controls autoplay class="modal-video"></video>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  src: string;
}>();

const visible = ref(false);
const triggerVideoRef = ref<HTMLVideoElement | null>(null);

const onMouseEnter = () => {
  if (triggerVideoRef.value) {
    triggerVideoRef.value.play().catch(e => console.error("Auto-play prevented:", e));
  }
};

const onMouseLeave = () => {
  if (triggerVideoRef.value) {
    triggerVideoRef.value.pause();
    triggerVideoRef.value.currentTime = 0;
  }
};

const openModal = () => {
  visible.value = true;
  if (triggerVideoRef.value) {
    triggerVideoRef.value.pause();
  }
};

const closeModal = () => {
  visible.value = false;
};
</script>

<style scoped lang="scss">
.video-popup-trigger {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
  pointer-events: auto;

  .trigger-video {
    width: 100%;
    height: 100%;
    object-fit: fill; /* Match ImagePopup behavior, or cover */
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
    opacity: 0.8; /* Always show a bit or only on hover? User said "hover... start playing". Let's fade it out when playing or make it interactive */
    transition: opacity 0.3s ease;
    
    /* Initially visible to show it's a video */
    opacity: 1; 
    background: rgba(0, 0, 0, 0.1); 
  }

  /* When hovering, we play the video. Maybe hide the mask or emphasize the play button? */
  &:hover {
    .trigger-video {
      /* transform: scale(1.05); Optional scale effect */
    }
    
    .hover-mask {
       /* Fade out mask to see video playing, OR keep it to show clickability? */
       /* Let's keep the play icon but maybe make it transparent so we see the video moving */
       background: rgba(0, 0, 0, 0.1);
    }
    
    .play-icon-circle {
        transform: scale(1.1);
        border-color: #17c7fe;
        
        .play-icon {
            border-left-color: #17c7fe;
        }
    }
  }

  .play-icon-circle {
    width: 50px;
    height: 50px;
    border: 3px solid #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    background: rgba(0,0,0,0.3);
    
    .play-icon {
      width: 0;
      height: 0;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-left: 18px solid #fff;
      margin-left: 4px; /* Optical centering */
      transition: all 0.3s ease;
    }
  }
}

.video-popup-modal {
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
    width: 80vw;
    max-width: 1200px; /* Limit max width */
    height: auto;
    max-height: 90vh;
    animation: zoomIn 0.3s ease;
    display: flex; /* Remove bottom space */
    background: #000;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(23, 199, 254, 0.3);
    border: 1px solid rgba(23, 199, 254, 0.3);

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
      z-index: 10001;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
        color: #17c7fe;
        border-color: #17c7fe;
      }
    }

    .modal-video {
      width: 100%;
      height: 100%;
      max-height: 80vh;
      border-radius: 8px;
      outline: none;
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

