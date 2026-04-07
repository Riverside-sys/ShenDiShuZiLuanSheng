<!--
 * @Author: mekeny1
 * @Date: 2025-09-06 02:02:01
 * @LastEditors: mekeny1
 * @LastEditTime: 2025-09-06 12:01:12
 * @FilePath: \gs_app\src\views\UndergroundMineViewer.vue
 * @Description:
 * Copyright (c) 2025 by mekeny1, All Rights Reserved.
-->
<template>
  <div class="mine-viewer-ultimate">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-overlay">
      <div class="error-content">
        <h3>❌ 加载错误</h3>
        <p>{{ error }}</p>
        <button @click="clearError">重试</button>
      </div>
    </div>

    <!-- 3D容器 -->
    <div ref="containerRef" class="viewer-container"></div>

    <!-- 控制面板 -->
    <div class="controls">
      <button @click="goBack" class="btn">🏠 返回</button>
      <button @click="loadModel" :disabled="isLoading" class="btn">
        {{ modelLoaded ? '🔄 重载' : '📦 加载' }}
      </button>
      <span v-if="modelLoaded" class="status">✅ 已加载</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as GaussianSplats from '@mkkellogg/gaussian-splats-3d'

const router = useRouter()

// 状态
const containerRef = ref<HTMLElement>()
const isLoading = ref(false)
const error = ref<string | null>(null)
const loadingMessage = ref('')
const modelLoaded = ref(false)

// 查看器
let viewer: any = null
let cleanupInterval: number | null = null
let uiMutationObserver: MutationObserver | null = null

// 终极UI清理函数
const ultimateUICleanup = () => {
  // 1. 移除已知的GaussianSplats UI元素
  const uiSelectors = [
    '.lil-gui',
    '.progressBarOuterContainer',
    '.spinnerOuterContainer0',
    '.spinnerOuterContainer1',
    '.spinnerOuterContainer2',
    '.infoPanel',
    '[class*="progressBar"]',
    '[class*="spinner"]',
    '.splatTree',
    '.controlPanel',
  ]

  uiSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    })
  })

  // 2. 查找并处理阻挡元素
  const allElements = document.querySelectorAll('*')
  allElements.forEach((el) => {
    const style = window.getComputedStyle(el)
    const rect = el.getBoundingClientRect()

    // 检查是否是全屏覆盖且有高z-index的元素
    if (style.position === 'absolute' || style.position === 'fixed') {
      const zIndex = parseInt(style.zIndex)

      // 如果是全屏覆盖的高z-index元素
      if (
        !isNaN(zIndex) &&
        zIndex > 100 &&
        rect.width >= window.innerWidth * 0.8 &&
        rect.height >= window.innerHeight * 0.8
      ) {
        // 确保不是我们自己的元素
        if (!containerRef.value?.contains(el) && !el.closest('.mine-viewer-ultimate')) {
          // 不直接删除，而是禁用pointer-events
          ;(el as HTMLElement).style.pointerEvents = 'none'
          console.log('🛡️ 禁用了阻挡元素的pointer-events')
        }
      }
    }
  })

  // 3. 强制重置body的overflow
  document.body.style.overflow = 'hidden'
}

// 设置MutationObserver来实时监控和清理UI
const setupUIObserver = () => {
  if (uiMutationObserver) return

  uiMutationObserver = new MutationObserver((mutations) => {
    let needsCleanup = false

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element
          const className = element.className || ''

          // 检测到GaussianSplats UI元素立即清理
          if (
            className.includes('lil-gui') ||
            className.includes('progressBar') ||
            className.includes('spinner') ||
            className.includes('infoPanel')
          ) {
            needsCleanup = true
          }
        }
      })
    })

    if (needsCleanup) {
      setTimeout(ultimateUICleanup, 0)
    }
  })

  uiMutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  })
}

// 加载模型
const loadModel = async () => {
  if (!containerRef.value) {
    error.value = '容器未准备好'
    return
  }

  try {
    isLoading.value = true
    error.value = null
    loadingMessage.value = '正在初始化...'

    // 清理现有实例
    if (viewer) {
      loadingMessage.value = '清理现有实例...'
      try {
        viewer.dispose()
      } catch (e) {
        console.warn('清理警告:', e)
      }
      viewer = null
    }

    // 清空容器
    containerRef.value.innerHTML = ''

    // 等待DOM更新
    await nextTick()

    loadingMessage.value = '创建3D查看器...'

    // 立即开始UI监控
    setupUIObserver()

    // 创建查看器 - 使用最小配置
    viewer = new GaussianSplats.Viewer({
      // 基础配置
      cameraUp: [0, 1, 0],
      initialCameraPosition: [0, 10, 15],
      initialCameraLookAt: [0, 0, 0],

      // 容器
      rootElement: containerRef.value,

      // 尝试禁用UI的配置
      showSplatTree: false,
      showControlPanel: false,
      enableSplatTree: false,
      enableControlPanel: false,

      // 性能配置
      halfPrecisionCovariancesOnGPU: true,
      devicePixelRatio: Math.min(window.devicePixelRatio, 1.5),

      // 渲染配置
      enableThreeJSMatrixUpdate: true,
    })

    loadingMessage.value = '加载高斯模型文件...'

    // 加载场景
    await viewer.addSplatScene('/mines/gs/VID_20250307_160117_point_cloud.ply', {
      progressiveLoad: true,
      showLoadingSpinner: false,
      showLoadingProgressBar: false,
      showLoadingUI: false,
    })

    loadingMessage.value = '启动渲染...'

    // 启动查看器
    viewer.start()

    // 等待一下让所有UI元素创建完成，然后清理
    setTimeout(() => {
      ultimateUICleanup()

      // 设置定期清理
      if (cleanupInterval) {
        clearInterval(cleanupInterval)
      }
      cleanupInterval = setInterval(ultimateUICleanup, 1000)

      modelLoaded.value = true
      console.log('✅ 模型加载完成，UI已清理')
    }, 2000)
  } catch (err) {
    console.error('❌ 加载失败:', err)
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    isLoading.value = false
  }
}

// 清除错误
const clearError = () => {
  error.value = null
}

// 返回
const goBack = () => {
  router.push('/')
}

// 生命周期
onMounted(() => {
  console.log('🚀 UndergroundMine Viewer mounted')
  setTimeout(loadModel, 500)
})

onUnmounted(() => {
  console.log('🔄 UndergroundMine Viewer unmounting...')

  // 停止UI监控
  if (uiMutationObserver) {
    uiMutationObserver.disconnect()
    uiMutationObserver = null
  }

  // 清理定时器
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }

  // 清理查看器
  if (viewer) {
    try {
      viewer.dispose()
    } catch (e) {
      console.warn('Dispose warning:', e)
    }
    viewer = null
  }

  // 最后一次清理
  ultimateUICleanup()

  // 恢复body样式
  document.body.style.overflow = ''
})
</script>

<style scoped>
.mine-viewer-ultimate {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.viewer-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content,
.error-content {
  text-align: center;
  color: white;
  padding: 2rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top: 3px solid #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #333;
}

.btn {
  padding: 8px 16px;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 80px;
}

.btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn:disabled {
  background: #6b7280;
  cursor: not-allowed;
  transform: none;
}

.status {
  color: #10b981;
  font-size: 14px;
  font-weight: 500;
}

.error-content button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.error-content button:hover {
  background: #b91c1c;
}
</style>

<style>
/* 全局样式 - 强制隐藏和禁用GaussianSplats UI */
.lil-gui,
.progressBarOuterContainer,
.spinnerOuterContainer0,
.spinnerOuterContainer1,
.spinnerOuterContainer2,
.infoPanel,
[class*='progressBar'],
[class*='spinner'],
.splatTree,
.controlPanel {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  position: absolute !important;
  left: -9999px !important;
  top: -9999px !important;
}

/* 防止全屏覆盖阻挡交互 */
body > div[style*='position: absolute'][style*='width: 100%'],
body > div[style*='position: fixed'][style*='width: 100%'] {
  pointer-events: none !important;
}

/* 确保我们的容器可以接收事件 */
.mine-viewer-ultimate,
.mine-viewer-ultimate * {
  pointer-events: auto !important;
}

/* 但是禁用已知的阻挡元素 */
.mine-viewer-ultimate .lil-gui,
.mine-viewer-ultimate [class*='progressBar'],
.mine-viewer-ultimate [class*='spinner'],
.mine-viewer-ultimate .infoPanel {
  pointer-events: none !important;
}
</style>
