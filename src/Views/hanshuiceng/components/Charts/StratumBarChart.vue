<template>
  <div class="chart-card">
    <div class="chart-title">苏北井网真实资料摘要</div>
    <div class="summary-grid">
      <div v-for="card in model.summaryCards" :key="card.label" class="summary-card">
        <strong>{{ card.value }}</strong>
        <span>{{ card.label }}</span>
      </div>
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
  padding: 9px 14px;
  font-size: 14px;
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
  gap: 10px;
  padding: 14px;
  flex: 1;
}
.summary-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 12px;
  background: rgba(23, 199, 254, 0.05);
  border-left: 2px solid rgba(23, 199, 254, 0.45);
}
.summary-card strong {
  color: #fff;
  font-family: "Courier New", monospace;
  font-size: 18px;
}
.summary-card span {
  color: rgba(160, 200, 220, 0.8);
  font-size: 12px;
}
</style>
