<template>
  <LayoutPanel title="预警信息">
    <div class="wrap">
      <div class="item-list" ref="container">
        <div class="item" v-for="(row, idx) in list" :key="idx">
          <div class="item-indicator" :class="`level-${row.type}`">
            <span class="dot"></span>
          </div>
          <div class="item-name">{{ row.name }}</div>
          <div class="item-event">{{ row.event }}</div>
          <div class="item-time">{{ row.time }}</div>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import { ref, onMounted, onUnmounted } from 'vue'

const list = ref([
  { name: '1#压力传感器', event: '压力异常升高', type: 1, time: '06:12' },
  { name: '3#气体检测仪', event: '氢气浓度偏高', type: 3, time: '07:35' },
  { name: '2#温度传感器', event: '温度超限报警', type: 1, time: '08:21' },
  { name: '5#位移监测点', event: '位移量增大', type: 2, time: '09:44' },
  { name: '1#注气阀门', event: '阀门状态异常', type: 3, time: '10:18' },
  { name: '4#微震传感器', event: '微震事件频繁', type: 2, time: '11:32' },
  { name: '2#套管监测', event: '套管应力偏高', type: 1, time: '12:05' },
  { name: '6#渗漏检测', event: '微量渗漏预警', type: 3, time: '13:47' },
  { name: '3#地表沉降', event: '沉降速率增大', type: 2, time: '14:22' },
  { name: '7#声发射仪', event: '异常声发射', type: 1, time: '16:15' },
  { name: '4#气体检测仪', event: 'H₂S浓度偏高', type: 3, time: '17:08' },
  { name: '2#注气阀门', event: '流量异常', type: 2, time: '18:42' },
  { name: '5#温度传感器', event: '温度骤变', type: 1, time: '19:55' },
  { name: '3#微震传感器', event: '微震频次上升', type: 3, time: '20:30' },
  { name: '1#渗漏检测', event: '卤水渗入预警', type: 1, time: '21:18' },
])

const container = ref<HTMLElement>()

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (!container.value) return
    container.value.classList.add('scroll')
    setTimeout(() => {
      if (!timer || !container.value) return
      container.value.classList.remove('scroll')
      list.value.push(list.value.shift()!)
    }, 1500)
  }, 3000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style lang="scss" scoped>
@keyframes row-out {
  from { top: 0; }
  to { top: -38px; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.wrap {
  height: 100%;
  overflow: hidden;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 670px;

  &.scroll {
    position: relative;
    animation: row-out 1s ease-in-out forwards;
  }

  .item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    font-size: 14px;
    border-radius: 4px;
    background: linear-gradient(90deg, rgba(91, 199, 250, 0.08), transparent);
    border-left: 2px solid transparent;
    transition: background 0.3s;

    &:hover {
      background: linear-gradient(90deg, rgba(91, 199, 250, 0.15), transparent);
    }

    .item-indicator {
      flex-shrink: 0;
      width: 20px;
      display: flex;
      align-items: center;
      justify-content: center;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: block;
      }

      &.level-1 {
        .dot {
          background: #74fabd;
          box-shadow: 0 0 8px rgba(116, 250, 189, 0.6);
          animation: pulse 2s infinite;
        }
      }

      &.level-2 {
        .dot {
          background: #5bc7fa;
          box-shadow: 0 0 8px rgba(91, 199, 250, 0.6);
        }
      }

      &.level-3 {
        .dot {
          background: #f1bd49;
          box-shadow: 0 0 8px rgba(241, 189, 73, 0.6);
          animation: pulse 1.5s infinite;
        }
      }
    }

    .item-name {
      width: 35%;
      color: #d0e0f0;
      font-size: 13px;
    }

    .item-event {
      width: 40%;
      color: #fff;
      font-size: 13px;
    }

    .item-time {
      width: 25%;
      text-align: right;
      color: #7eb7d4;
      font-size: 12px;
    }
  }
}
</style>
