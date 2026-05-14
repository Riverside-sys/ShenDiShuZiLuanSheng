<template>
  <LayoutPanel title="盐穴单体详情">
    <div class="cave-list">
      <div
        v-for="cave in caveData"
        :key="cave.id"
        class="cave-row"
        :class="{ active: activeId === cave.id }"
        @click="$emit('select', cave.id)"
      >
        <div class="cave-idx">{{ cave.id }}</div>
        <div class="cave-meta">
          <div class="cave-name">{{ cave.name }}</div>
          <div class="cave-info">
            <span>深度: {{ cave.depth }}</span>
            <span class="tag" :style="{ background: cave.statusColor + '30', color: cave.statusColor }">
              {{ cave.status }}
            </span>
          </div>
        </div>
        <div class="cave-indicator">
          <div class="bar" :style="{ width: cave.healthScore + '%', background: cave.statusColor }"></div>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from '../LayoutPanel.vue'

export interface CaveData {
  id: string
  name: string
  depth: string
  volume: string
  status: string
  statusColor: string
  healthScore: number
}

defineProps<{
  caveData: CaveData[]
  activeId: string | null
}>()

defineEmits<{
  (e: 'select', id: string): void
}>()
</script>

<style lang="scss" scoped>
.cave-list {
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.cave-row {
  display: grid;
  grid-template-columns: 40px 1fr 60px;
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

  .cave-idx {
    font-family: Douyu, sans-serif;
    font-size: 18px;
    color: #5fc8ff;
    text-align: center;
  }

  .cave-name {
    font-size: 13px;
    color: #cfeaff;
  }

  .cave-info {
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #7ea7c4;

    .tag {
      padding: 1px 6px;
      border-radius: 2px;
      font-size: 10px;
    }
  }

  .cave-indicator {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;

    .bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s;
    }
  }
}
</style>