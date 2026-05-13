<template>
  <LayoutPanel title="自动巡检进度">
    <div class="progress-wrap">
      <div class="ring">
        <svg viewBox="0 0 120 120">
          <circle class="ring-bg" cx="60" cy="60" r="52" />
          <circle
            class="ring-fg"
            cx="60"
            cy="60"
            r="52"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div class="ring-center">
          <div class="ring-value">{{ progress }}<span class="unit">%</span></div>
          <div class="ring-label">{{ running ? '巡检中' : '待启动' }}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">巡检方式</div>
          <div class="info-value">沿巷道路径</div>
        </div>
        <div class="info-item">
          <div class="info-label">采样间隔</div>
          <div class="info-value">2.5 m</div>
        </div>
        <div class="info-item">
          <div class="info-label">预计耗时</div>
          <div class="info-value">60 s</div>
        </div>
        <div class="info-item">
          <div class="info-label">异常计数</div>
          <div class="info-value warn">0</div>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from '../LayoutPanel.vue'
import { computed } from 'vue'

const props = defineProps<{
  progress: number
  running: boolean
}>()

const circumference = 2 * Math.PI * 52
const dashOffset = computed(() => circumference * (1 - props.progress / 100))
</script>

<style lang="scss" scoped>
.progress-wrap {
  display: grid;
  grid-template-columns: 130px 1fr;
  align-items: center;
  gap: 18px;
  height: 100%;
  padding: 4px 6px;
}

.ring {
  position: relative;
  width: 130px;
  height: 130px;

  svg {
    width: 100%;
    height: 100%;
  }

  .ring-bg {
    fill: none;
    stroke: rgba(95, 200, 255, 0.15);
    stroke-width: 8;
  }

  .ring-fg {
    fill: none;
    stroke: url(#gradient);
    stroke: #65f6c5;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.3s ease;
    filter: drop-shadow(0 0 4px rgba(101, 246, 197, 0.6));
  }

  .ring-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #cfeaff;

    .ring-value {
      font-family: Douyu, sans-serif;
      font-size: 26px;
      color: #65f6c5;

      .unit {
        font-size: 14px;
        margin-left: 2px;
        color: #7ea7c4;
      }
    }

    .ring-label {
      font-size: 12px;
      color: #7ea7c4;
      margin-top: 4px;
      letter-spacing: 2px;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px;
  text-align: left;
}

.info-item {
  padding: 8px 10px;
  background: rgba(20, 50, 80, 0.35);
  border-left: 2px solid rgba(95, 200, 255, 0.35);

  .info-label {
    font-size: 11px;
    color: #7ea7c4;
  }

  .info-value {
    margin-top: 4px;
    font-family: Douyu, sans-serif;
    font-size: 16px;
    color: #d4f7ff;

    &.warn {
      color: #f1bd49;
    }
  }
}
</style>
