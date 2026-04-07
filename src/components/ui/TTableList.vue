<script setup>
defineProps({
  list: {
    type: Array,
    default: () => []
  },
  labelWidth: {
    type: Number,
    required: false
  }
})

const successClass = (item) => {
  return item.value && item.value.includes('运行')
}

const errorClass = (item) => {
  return (item.value && item.value.includes('停止')) || item.warning
}
</script>

<template>
  <div class="t-table-list">
    <table>
      <tr v-for="(item, i) in list" :key="i">
        <td :style="{ width: labelWidth && `${labelWidth}px` }">
          <div>{{ item.label }}</div>
        </td>
        <td>
          <div
            :class="{ success: successClass(item), error: errorClass(item) }"
            style="white-space: pre-line"
          >
            {{ item.value }}
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped lang="less">
.t-table-list {
  width: 100%;
  table {
    width: 100%;
    border: unset;
    border-collapse: collapse;
    border-spacing: 0;
    tr:nth-child(odd) {
      background: rgba(26, 71, 114, 0.5); // 奇数行的颜色
    }
    tr:nth-child(even) {
      background: rgba(26, 71, 114, 0.2); // 偶数行的颜色
    }
    tr {
      td {
        box-sizing: border-box;
        padding: 10px;
        color: #fff;
        font-family: 'Alibaba PuHuiTi';
        font-size: 16px;
        border-left: 1px solid rgba(27, 90, 151, 0.52);
        &:first-of-type {
          border-left: none;
          width: 200px;
        }
        .success {
          color: #10ff70;
        }
        .error {
          color: #fb5825;
        }
      }
    }
  }
}
</style>
