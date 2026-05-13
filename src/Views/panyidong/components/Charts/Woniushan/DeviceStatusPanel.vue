<template>
  <LayoutPanel title="巷道设备状态">
    <div class="device-grid">
      <div v-for="(item, idx) in devices" :key="idx" class="device-card" :class="item.status">
        <div class="device-icon">
          <ion-icon :name="item.icon"></ion-icon>
        </div>
        <div class="device-body">
          <div class="device-name">{{ item.name }}</div>
          <div class="device-meta">
            <span class="status-dot"></span>
            <span class="status-text">{{ statusLabel(item.status) }}</span>
            <span class="device-count">{{ item.online }}/{{ item.total }}</span>
          </div>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from '../LayoutPanel.vue'

type DeviceStatus = 'normal' | 'warning' | 'offline'

interface Device {
  name: string
  icon: string
  status: DeviceStatus
  online: number
  total: number
}

const devices: Device[] = [
  { name: '掘进机', icon: 'construct-outline', status: 'normal', online: 2, total: 2 },
  { name: '通风机', icon: 'aperture-outline', status: 'normal', online: 4, total: 4 },
  { name: '瓦斯传感器', icon: 'warning-outline', status: 'normal', online: 11, total: 11 },
  { name: '风速传感器', icon: 'speedometer-outline', status: 'warning', online: 5, total: 6 },
  { name: '人员定位', icon: 'radio-outline', status: 'normal', online: 8, total: 8 },
  { name: '视频监控', icon: 'videocam-outline', status: 'warning', online: 14, total: 16 },
]

const statusLabel = (s: DeviceStatus) =>
  ({ normal: '在线', warning: '部分离线', offline: '离线' }[s])
</script>

<style lang="scss" scoped>
.device-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 10px;
  height: 100%;
  text-align: left;
}

.device-card {
  display: grid;
  grid-template-columns: 38px 1fr;
  grid-column-gap: 10px;
  align-items: center;
  padding: 8px 10px;
  background: rgba(20, 50, 80, 0.35);
  border-left: 2px solid rgba(95, 200, 255, 0.4);

  &.warning {
    border-left-color: #f1bd49;
  }

  &.offline {
    border-left-color: #ff6b6b;
  }

  .device-icon {
    width: 36px;
    height: 36px;
    border: 1px solid rgba(95, 200, 255, 0.45);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5fc8ff;

    ion-icon {
      font-size: 20px;
    }
  }

  .device-name {
    font-size: 13px;
    color: #cfeaff;
  }

  .device-meta {
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #7ea7c4;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #65f6c5;
      box-shadow: 0 0 6px #65f6c5;
    }

    .device-count {
      margin-left: auto;
      color: #d4f7ff;
      font-family: Douyu, sans-serif;
    }
  }

  &.warning .status-dot {
    background: #f1bd49;
    box-shadow: 0 0 6px #f1bd49;
  }

  &.offline .status-dot {
    background: #ff6b6b;
    box-shadow: 0 0 6px #ff6b6b;
  }
}
</style>
