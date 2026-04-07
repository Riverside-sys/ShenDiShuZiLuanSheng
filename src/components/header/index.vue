<template>
  <div class="layout-header">
    <div class="header-midden">
      <div class="cn">深地特殊空间数字孪生可视化平台</div>
      <div class="en">Deep underground digital twin visualization platform</div>
    </div>
    <div class="header-left">
      <div class="nav-btn" @click="handleHome">首页</div>
      <div class="nav-btn scene-switch-btn" @click.stop="toggleSceneMenu">
        {{ currentSceneName }}
        <div v-if="isSceneMenuOpen" class="scene-dropdown">
          <div v-for="scene in scenes" :key="scene.path" class="scene-option"
            @click="handleSceneSelect(scene)">
            {{ scene.name }}
          </div>
        </div>
      </div>
    </div>
    <div class="header-right">
      <span>{{ timeStr }}</span>
      <span>{{ dateStr }}</span>
      <span>{{ weekStr }}</span>
      <span>13°c</span>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, onUnmounted, watch, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import moment from "moment";
// import * as moment from "moment";

const router = useRouter();
const route = useRoute();
const isSceneMenuOpen = ref(false);

const scenes = [
  { name: "废弃矿井", path: "/panyidong" },
  // { name: "含水层", path: "/underground/aquifer" },
  { name: "含水层", path: "/hanshuiceng" },
  { name: "盐穴", path: "/underground/mines" },
];

const currentSceneName = ref("废弃矿井");

// 时间相关
const timeStr = ref('');
const dateStr = ref('');
const weekStr = ref('');
let timer: any = null;

const toggleSceneMenu = () => {
  isSceneMenuOpen.value = !isSceneMenuOpen.value;
};

// 首页点击
const handleHome = () => {
  router.push("/home");
};

const handleSceneSelect = (scene: { name: string, path: string }) => {
  router.push(scene.path);
  currentSceneName.value = scene.name;
  isSceneMenuOpen.value = false; // 选择后关闭菜单
};

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    const matchedScene = scenes.find(scene => scene.path === newPath);
    if (matchedScene) {
      currentSceneName.value = matchedScene.name;
    }
  },
  { immediate: true }
);

// 点击其他地方关闭下拉框
const closeMenu = () => {
  isSceneMenuOpen.value = false;
};

const updateTime = () => {
  const now = moment();
  timeStr.value = now.format('HH:mm:ss');
  dateStr.value = now.format('YYYY-MM-DD');
  weekStr.value = now.format('dddd');
};

onMounted(() => {
  document.addEventListener('click', closeMenu);
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenu);
});
</script>

<style lang="scss" scoped>
@mixin font-color() {
  background: linear-gradient(0deg, #b9cfff 0%, #fff 99%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes light-go {
  from {
    left: 500px;
  }

  to {
    left: 1100px;
    opacity: 0;
  }
}

.layout-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  z-index: 2000;
  /* 提高层级，确保在最上层 */
  background-image: url(@/assets/dianchang/title_bg.png);
  background-repeat: no-repeat;
  background-position: center top;
  background-size: 100% 100%;

  &::after {
    position: absolute;
    bottom: -55px;
    left: 500px;
    width: 500px;
    height: 100px;
    content: '';
    background-image: url(@/assets/dianchang/light_bg.png);
    background-repeat: no-repeat;
    background-size: contain;
    animation: light-go 3s ease-in-out infinite forwards;
    pointer-events: none;
    /* 防止遮挡点击 */
  }

  .header-midden {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    overflow-x: hidden;
    font-family: DouYu;
    color: #fff;
    flex: 1;
    /* 自适应剩余空间 */

    .cn {
      font-size: 30px;
      font-weight: 700;
      @include font-color;
      white-space: nowrap;
      /* 防止换行 */
    }

    .en {
      position: relative;
      font-size: 10px;
      @include font-color;
      white-space: nowrap;
      /* 防止换行 */
    }
  }

  .header-left {
    position: absolute;
    /* 保持绝对定位 */
    left: 2vw;
    /* 改用 vw */
    // left: 60px;
    height: 100%;
    display: flex;
    grid-gap: 2vw;
    /* 间距改为 vw */
    // grid-gap: 40px;
    align-items: center;
    font-size: 18px;
    color: #fff;
    /* z-index: 2000; */
    /* 保证按钮可点击 */

    .nav-btn {
      cursor: pointer;
      font-family: YouSheBiaoTiHei, sans-serif;
      font-size: 18px;
      width: 136px;
      height: 35px;
      line-height: 35px;
      text-align: center;
      font-weight: 700;
      font-style: italic;
      background: url(@/assets/guigu/dataScreen-header-btn-bg-l.png) no-repeat;
      border-radius: 4px;
      transition: all 0.3s;
      position: relative;
      /* 为下拉菜单定位 */

      &:hover {
        color: #29fcff;
      }
    }

    .scene-switch-btn {
      position: relative;

      .scene-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: rgba(16, 29, 41, 0.95);
        border: 1px solid #17c7fe;
      }

      .scene-option {
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: #05e8fe;
        font-size: 16px;
        cursor: pointer;
      }

      .scene-option:hover {
        background: rgba(23, 199, 254, 0.3);
        color: #fff;
      }

      .scene-option:not(:last-child) {
        border-bottom: 1px solid rgba(23, 199, 254, 0.2);
      }
    }
  }

  .header-right {
    position: absolute;
    /* 保持绝对定位 */
    right: 2vw;
    /* 改用 vw */
    // right: 30px;
    top: 50%;
    transform: translateY(-50%);
    // top: 20px;
    display: flex;
    grid-gap: 1.5vw;
    /* 间距改为 vw */
    // grid-gap: 20px;
    font-size: 16px;
    color: #fff;
    white-space: nowrap;

    span {
      position: relative;
      display: flex;
      align-items: center;
      text-shadow: 0 3px 2px #84a8f663;
      @include font-color;

      &:not(:last-child)::after {
        position: absolute;
        right: -10px;
        width: 2px;
        height: 10px;
        content: '';
        background-color: #fff;
        opacity: 0.2;
      }
    }
  }
}

/* 媒体查询处理小屏幕 */
@media screen and (max-width: 1366px) {
  .layout-header {
    .header-midden {
      .cn {
        font-size: 24px;
      }

      .en {
        font-size: 9px;
        transform: scale(0.9);
      }
    }

    .header-left {
      .nav-btn {
        width: 100px;
        font-size: 14px;
        background-size: 100% 100%;
      }
    }

    .header-right {
      font-size: 12px;
    }
  }
}
</style>
