<template>
  <LayoutPanel title="矿区设备规模">
    <div class="weather-monitor">
      <div v-for="(item, index) in source" :key="index" class="widget-weather-item">
        <!-- <div class="weather-icon" :class="item.icon"></div> -->
        <div class="weather-icon">
          <ion-icon :name="item.icon"></ion-icon>
        </div>
        <div class="weather-label">{{ item.label }}</div>
        <div class="weather-value">
          <span class="value">{{ item.value }}</span>
          <span class="unit">{{ item.unit }}</span>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
const source = [
  {
    icon: 'construct-outline',
    label: '掘进机',
    value: '2',
    unit: '台',
  },
  {
    icon: 'aperture-outline',
    label: '局部通风机',
    value: '4',
    unit: '台',
  },
  {
    icon: 'swap-horizontal-outline',
    label: '皮带运输机',
    value: '1',
    unit: '部',
  },
  {
    icon: 'hammer-outline',
    label: '锚杆钻机',
    value: '3',
    unit: '台',
  },
  {
    icon: 'warning-outline',
    label: '瓦斯传感器',
    value: '12',
    unit: '个',
  },
  {
    icon: 'speedometer-outline',
    label: '风速传感器',
    value: '6',
    unit: '个',
  },
  {
    icon: 'radio-outline',
    label: '人员定位基站',
    value: '8',
    unit: '个',
  },
  {
    icon: 'videocam-outline',
    label: '视频监控',
    value: '16',
    unit: '台',
  },
  {
    icon: 'mic-outline',
    label: '语音广播',
    value: '10',
    unit: '个',
  },
]
</script>

<style lang="scss" scoped>
.container {
  height: 100%;

  //   background-color: red;
}

.weather-monitor {
  box-sizing: border-box;
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  height: 100%;
  padding-top: 10px;

  $icon-size: 34px;

  .widget-weather-item {
    box-sizing: border-box;
    display: flex;
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: $icon-size auto;
    grid-column-gap: 10px;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0 8px;
    background-color: rgba(93, 101, 122, 16%);

    .weather-icon {
      display: flex;
      grid-row: 1 /3;
      align-items: center;
      justify-content: center;
      width: $icon-size;
      height: $icon-size;
      border: 1px solid #5bc7fa;
      border-radius: 50%;

      ion-icon {
        font-size: 24px;
      }

      // box-shadow: 0 0 10px #75fbb87d;
    }

    .weather-label {
      margin-top: 10px;
      font-size: 13px;
      color: #999;
    }

    .weather-value {
      margin-bottom: 6px;
      font-size: 14px;
    }
  }
}
</style>
