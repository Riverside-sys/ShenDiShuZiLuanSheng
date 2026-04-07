<template>
  <div class="toolbar-items">
    <!-- 定位 -->
    <div class="tool-item" :class="{ active: activeMenu === 'location' }"
      @click="toggleMenu('location')">
      <div class="icon-box">
        <ion-icon name="navigate-outline"></ion-icon>
      </div>
      <span>定位</span>

      <!-- 定位子菜单 -->
      <transition name="fade">
        <div class="sub-menu" v-if="activeMenu === 'location'" @click.stop>
          <div class="menu-item" v-for="item in locationItems" :key="item.value"
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
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const emit = defineEmits(['flyTo']);
const activeMenu = ref<string | null>(null);

const locationItems = [
  { label: '井底煤仓', value: 'position1' },
  { label: '中央巷道', value: 'position2' },
  { label: '三一采区', value: 'position3' }
];

const sceneItems = [
  { label: '全矿模拟', value: 'all_mine_simulation' },
  { label: '巷道标签', value: 'tunnel_label' },
  { label: '高斯泼溅', value: 'gaussian_splatting' }
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

  if (item.value === 'gaussian_splatting') {
    router.push({ name: 'mines_roadway_gsplat' });
  } else if (['position1', 'position2', 'position3'].includes(item.value)) {
    emit('flyTo', item.value);
  }

  // activeMenu.value = null; // 如果需要在点击后关闭菜单，可以取消注释
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
