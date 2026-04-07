<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'

let timer = null

const props = defineProps({
  start: {
    type: Boolean,
    default: false
  }
})

let time = ref(0)

const formattedTime = computed(() => {
  const hours = Math.floor(time.value / 3600000)
  const minutes = Math.floor((time.value % 3600000) / 60000)
  const seconds = Math.floor((time.value % 60000) / 1000)

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':')
})

const startTime = () => {
  time.value = 0
  timer = setInterval(() => {
    time.value += 1000
  }, 1000)
}

const stopTime = () => {
  if (timer) clearInterval(timer)
}

watch(
  () => props.start,
  (value) => {
    if (value) {
      startTime()
    } else {
      stopTime()
    }
  }
)
onUnmounted(() => {
  stopTime()
})
</script>

<template>
  <span>{{ formattedTime }}</span>
</template>

<style scoped lang="less"></style>
