<template>
  <div class="chart-card">
    <div class="chart-title">苏北井网真实资料摘要</div>
    <div class="summary-grid">
      <div v-for="card in model.summaryCards" :key="card.label" class="summary-card">
        <strong>{{ card.value }}</strong>
        <span>{{ card.label }}</span>
      </div>
    </div>
    <div class="summary-note">
      左侧图表均来自吉大结构化资料；三维默认展示井网示意体（测井深度包络），演示地层块可切换查看。吉大 `.ovobj` 原储层网格尚未转换接入。
    </div>
  </div>
</template>

<script setup lang="ts">
import { createAquiferHudChartModel } from "../../utils/aquiferHudCharts";

const model = createAquiferHudChartModel();
</script>

<style scoped lang="scss">
.chart-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgba(6, 16, 32, 0.75);
  border: 1px solid rgba(23, 199, 254, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  overflow: hidden;
}
.chart-title {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(23, 199, 254);
  border-bottom: 1px solid rgba(23, 199, 254, 0.12);
  background: rgba(23, 199, 254, 0.06);
  letter-spacing: 1px;
  flex-shrink: 0;
}
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px;
  flex: 1;
}
.summary-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 10px;
  background: rgba(23, 199, 254, 0.05);
  border-left: 2px solid rgba(23, 199, 254, 0.45);
}
.summary-card strong {
  color: #fff;
  font-family: "Courier New", monospace;
  font-size: 16px;
}
.summary-card span {
  color: rgba(160, 200, 220, 0.8);
  font-size: 11px;
}
.summary-note {
  margin: 0 12px 12px;
  padding: 8px 9px;
  color: #d9bd75;
  font-size: 11px;
  line-height: 1.5;
  background: rgba(217, 189, 117, 0.07);
  border: 1px solid rgba(217, 189, 117, 0.2);
}
</style>
