<script setup>
import { removePxSuffix } from '@/utils'
import { debounce } from 'lodash-es'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps({
  width: {
    type: Number,
    default: 1920
  },
  height: {
    type: Number,
    default: 1080
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  delay: {
    type: Number,
    default: 500
  },
  screenStyle: {
    type: Object,
    default: () => {}
  },
  wrapperStyle: {
    type: Object,
    default: () => {}
  }
})

const state = reactive({
  originalWidth: 0,
  originalHeight: 0,
  width: 0,
  height: 0
})

const styles = {
  screen: {
    overflow: 'hidden',
    backgroundSize: `100% 100%`,
    background: `transparent linear-gradient(to right, rgba(6, 29, 58, 1), rgba(114, 68, 15, 0) 50%, rgba(6, 29, 58, 1))`,
    width: `100vw`,
    height: `100vh`
  },
  wrapper: {
    transitionProperty: `all`,
    transitionTimingFunction: `cubic-bezier(0.4, 0, 0.2, 1)`,
    transitionDuration: `500ms`,
    position: `relative`,
    overflow: `hidden`,
    zIndex: 100,
    transformOrigin: `left top`
  }
}

const screenWrapper = ref()
const screen = ref()

// 初始化

const initializeDimensions = () => {
  return new Promise((resolve) => {
    screen.value.scrollTop = 0
    screen.value.scrollLeft = 0
    nextTick(() => {
      if (props.width && props.height) {
        state.width = props.width
        state.height = props.height
      } else {
        state.width = screenWrapper.value?.clientWidth
        state.height = screenWrapper.value?.clientHeight
      }
      if (!state.originalWidth || !state.originalHeight) {
        state.originalWidth = window.screen.width
        state.originalHeight = window.screen.height
      }
      resolve()
    })
  })
}

const updateDimensions = () => {
  if (state.width && state.height) {
    screenWrapper.value.style.width = `${removePxSuffix(state.width)}px`
    screenWrapper.value.style.height = `${removePxSuffix(state.height)}px`
  } else {
    screenWrapper.value.style.width = `${removePxSuffix(state.originalWidth)}px`
    screenWrapper.value.style.height = `${removePxSuffix(state.originalHeight)}px`
  }
}

const autoScale = (scale) => {
  const domWidth = screenWrapper.value.clientWidth
  const domHeight = screenWrapper.value.clientHeight
  const currentWidth = document.body.clientWidth
  const currentHeight = document.body.clientHeight
  screenWrapper.value.style.transform = `scale(${scale},${scale})`
  let mx = Math.max((currentWidth - domWidth * scale) / 2, 0)
  let my = Math.max((currentHeight - domHeight * scale) / 2, 0)
  screenWrapper.value.style.margin = `${my}px ${mx}px`
}

const updateScale = () => {
  // 获取真实视口尺寸
  const currentWidth = document.body.clientWidth
  const currentHeight = document.body.clientHeight
  // 获取大屏最终的宽高
  const realWidth = state.width || state.originalWidth
  const realHeight = state.height || state.originalHeight
  // 计算缩放比例
  const widthScale = currentWidth / +realWidth
  const heightScale = currentHeight / +realHeight
  // 若要铺满全屏，则按照各自比例缩放
  if (props.fullScreen) {
    screenWrapper.value.style.transform = `scale(${widthScale},${heightScale})`
    return false
  }
  // 按照宽高最小比例进行缩放
  const scale = Math.min(widthScale, heightScale)
  autoScale(scale)
}

const onResize = debounce(async () => {
  await initializeDimensions()
  updateDimensions()
  updateScale()
}, props.delay)

const clearListener = () => {
  window.removeEventListener('resize', onResize)
}

const addListener = () => {
  window.addEventListener('resize', onResize)
}

onMounted(() => {
  nextTick(async () => {
    await initializeDimensions()
    updateDimensions()
    updateScale()
    addListener()
  })
})

onUnmounted(() => {
  clearListener()
})
</script>

<template>
  <section class="t-screen" ref="screen" :style="{ ...styles.screen, ...screenStyle }">
    <div
      class="t-screen__wrapper"
      ref="screenWrapper"
      :style="{ ...styles.wrapper, ...wrapperStyle }"
    >
      <slot />
    </div>
  </section>
</template>

<style scoped lang="less"></style>
