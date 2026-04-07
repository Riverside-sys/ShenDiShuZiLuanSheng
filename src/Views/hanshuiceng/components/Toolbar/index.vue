<template>
  <div class="toolbar-items">
    <!-- 模型信息 -->
    <div class="tool-item" :class="{ active: activeMenu === 'modelInfo' }"
      @click="toggleMenu('modelInfo')">
      <div class="icon-box">
        <ion-icon name="information-circle-outline"></ion-icon>
      </div>
      <span>模型信息</span>

      <!-- 模型信息子菜单 -->
      <transition name="fade">
        <div class="sub-menu" v-if="activeMenu === 'modelInfo'" @click.stop>
          <div class="menu-item" v-for="item in modelInfoItems" :key="item.value"
            @click="handleItemClick(item)">
            {{ item.label }}
          </div>
        </div>
      </transition>
    </div>

    <!-- 场景 -->
    <div class="tool-item" :class="{ active: activeMenu === 'scene' }" @click="toggleMenu('scene')">
      <div class="icon-box">
        <ion-icon name="albums-outline"></ion-icon>
      </div>
      <span>场景</span>

      <!-- 场景子菜单 -->
      <transition name="fade">
        <div class="sub-menu" v-if="activeMenu === 'scene'" @click.stop>
          <div class="menu-item" v-for="item in sceneItems" :key="item.value"
            @click="handleItemClick(item)">
            {{ item.label }}
          </div>
        </div>
      </transition>
    </div>

    <!-- 弹窗组件 -->
    <Teleport to="body">
      <MetadataPopup ref="metadataPopupRef" />
      <ImagePreviewPopup ref="imagePreviewPopupRef" />
    </Teleport>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MetadataPopup from './MetadataPopup.vue';
import ImagePreviewPopup from './ImagePreviewPopup.vue';

const router = useRouter();
const emit = defineEmits(['flyTo']);
const activeMenu = ref<string | null>(null);
const metadataPopupRef = ref<InstanceType<typeof MetadataPopup> | null>(null);
const imagePreviewPopupRef = ref<InstanceType<typeof ImagePreviewPopup> | null>(null);

const modelInfoItems = [
  { label: '模型精度信息', value: 'model_precision_info' },
  { label: '模型几何信息', value: 'model_geometry_info' },
];

const sceneItems = [
  { label: '含水层预览', value: 'aquifer_preview' },
  { label: '速度模型-三维切片预览', value: '3d_slice_preview' },
  { label: '地质体分层', value: 'geological_body_layering' },
];

const toggleMenu = (menu: string) => {
  if (activeMenu.value === menu) {
    activeMenu.value = null;
  } else {
    activeMenu.value = menu;
  }
};

const handleItemClick = (item: any) => {
  console.log('Clicked:', item.label);

  if (item.value === 'model_precision_info') {
    metadataPopupRef.value?.open('precision');
  } else if (item.value === 'model_geometry_info') {
    metadataPopupRef.value?.open('geometry');
  } else if (item.value === 'geological_body_layering') {
    router.push('/underground/aquifer');
  } else if (item.value === 'aquifer_preview') {
    imagePreviewPopupRef.value?.open('/images/aquifer/demo/vp20_preview.png', '含水层预览');
  } else if (item.value === '3d_slice_preview') {
    imagePreviewPopupRef.value?.open('/images/aquifer/demo/速度模型动图.gif', '速度模型-三维切片预览');
  }

  activeMenu.value = null; // 点击后自动关闭菜单
};
</script>

<style scoped lang="scss">
.toolbar-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tool-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #fff;

  &:hover,
  &.active {
    .icon-box {
      background: rgba(0, 255, 255, 0.2);
      border-color: rgba(0, 255, 255, 0.8);
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
    }

    span {
      color: #0ff;
    }
  }

  span {
    font-size: 12px;
    transition: all 0.3s;
  }
}

.icon-box {
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  ion-icon {
    font-size: 28px;
    width: 100%;
    height: 100%;
    padding: 10px;
  }
}

/* 子菜单样式 */
.sub-menu {
  position: absolute;
  left: 65px;
  /* 50px + gap */
  top: 0;
  background: rgba(12, 28, 45, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  padding: 5px 0;
  min-width: 100px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);

  .menu-item {
    padding: 8px 16px;
    font-size: 14px;
    color: #e0e0e0;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    text-align: left;

    &:hover {
      background: rgba(0, 255, 255, 0.15);
      color: #0ff;
    }
  }
}

/* 简单的过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
