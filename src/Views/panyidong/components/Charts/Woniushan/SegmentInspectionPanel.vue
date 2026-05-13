<template>
  <LayoutPanel title="巷道分段概况">
    <div class="segment-list">
      <div
        v-for="seg in segments"
        :key="seg.id"
        class="segment-row"
        :class="{ active: seg.id === activeId, loaded: seg.loaded }"
        @click="$emit('focus', seg.id)"
      >
        <div class="seg-idx">{{ seg.id.toString().padStart(2, '0') }}</div>
        <div class="seg-meta">
          <div class="seg-name">{{ seg.name }}</div>
          <div class="seg-info">
            <span v-if="seg.loaded">{{ formatPoints(seg.pointCount) }} 点</span>
            <span v-else class="muted">未加载</span>
            <span v-if="seg.loaded && seg.hasColor" class="tag color">含色彩</span>
          </div>
        </div>
        <div class="seg-status">
          <span v-if="seg.id === activeId" class="dot active"></span>
          <span v-else-if="seg.loaded" class="dot ready"></span>
          <span v-else class="dot idle"></span>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from '../LayoutPanel.vue'

interface SegmentInfo {
  id: number
  name: string
  loaded: boolean
  pointCount: number
  hasColor: boolean
}

defineProps<{
  segments: SegmentInfo[]
  activeId: number | null
}>()

defineEmits<{
  (e: 'focus', id: number): void
}>()

const formatPoints = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + ' M'
  if (n >= 1000) return (n / 1000).toFixed(1) + ' K'
  return String(n)
}
</script>

<style lang="scss" scoped>
.segment-list {
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.segment-row {
  display: grid;
  grid-template-columns: 40px 1fr 20px;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  margin-bottom: 6px;
  background: rgba(20, 50, 80, 0.35);
  border-left: 2px solid rgba(95, 200, 255, 0.25);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: rgba(95, 200, 255, 0.18);
    border-left-color: rgba(95, 200, 255, 0.7);
  }

  &.active {
    background: rgba(101, 246, 197, 0.18);
    border-left-color: #65f6c5;
  }

  &.loaded:not(.active) {
    border-left-color: rgba(95, 200, 255, 0.6);
  }

  .seg-idx {
    font-family: Douyu, sans-serif;
    font-size: 18px;
    color: #5fc8ff;
    text-align: center;
  }

  .seg-name {
    font-size: 13px;
    color: #cfeaff;
  }

  .seg-info {
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #7ea7c4;

    .muted {
      color: #4f6a82;
    }

    .tag {
      padding: 1px 6px;
      border-radius: 2px;
      font-size: 10px;
      background: rgba(101, 246, 197, 0.18);
      color: #65f6c5;
    }
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4f6a82;

    &.ready {
      background: #5fc8ff;
      box-shadow: 0 0 6px #5fc8ff;
    }

    &.active {
      background: #65f6c5;
      box-shadow: 0 0 8px #65f6c5;
    }
  }
}
</style>
