<template>
  <aside v-if="presentation" class="research-panel">
    <header class="panel-header">
      <div>
        <div class="panel-eyebrow">真实研究资料</div>
        <h2>{{ presentation.wellId }} 井</h2>
      </div>
      <button class="panel-close" type="button" aria-label="关闭研究资料" @click="emit('close')">×</button>
    </header>

    <div class="panel-tabs" role="tablist" aria-label="研究资料类型">
      <button
        v-for="tab in presentation.availableTabs"
        :key="tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab"
        :aria-controls="`${tab}-research-panel`"
        :tabindex="activeTab === tab ? 0 : -1"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab === "log" ? "测井曲线" : "岩性柱" }}
      </button>
    </div>

    <p class="scope-note">
      本面板仅展示工作簿中的静态测井与岩性资料；当前未接入真实动态水位或流量监测数据。
    </p>

    <section
      v-if="activeTab === 'log' && presentation.log"
      id="log-research-panel"
      class="panel-content"
      role="tabpanel"
    >
      <div class="summary-grid">
        <div>
          <strong>{{ presentation.log.originalSampleCount.toLocaleString() }}</strong>
          <span>原始深度点</span>
        </div>
        <div>
          <strong>{{ presentation.log.visualizationSampleCount.toLocaleString() }}</strong>
          <span>绘图抽样点</span>
        </div>
        <div>
          <strong>
            {{ presentation.log.sourceDepthRange.minimum }}–{{ presentation.log.sourceDepthRange.maximum }} m
          </strong>
          <span>实际数据范围</span>
        </div>
      </div>

      <div v-if="hasDeclaredRangeDifference" class="data-warning">
        文件声明深度为
        {{ presentation.log.declaredDepthRange.minimum }}–{{ presentation.log.declaredDepthRange.maximum }} m，
        与实际数据范围不一致；图中按实际行数据展示。
      </div>

      <div class="channel-strip">
        <span
          v-for="channel in presentation.log.channels"
          :key="channel.id"
          :style="{ '--channel-color': channel.color }"
        >
          {{ channel.label }} · 有效 {{ channel.validSampleCount.toLocaleString() }}
        </span>
      </div>

      <div
        ref="chartRef"
        class="research-chart"
        role="img"
        :aria-label="`${presentation.wellId}井真实测井曲线，深度范围${presentation.log.sourceDepthRange.minimum}至${presentation.log.sourceDepthRange.maximum}米`"
      ></div>

      <p class="source-note">
        曲线仅使用原始单元格数据；当前为确定性可视化抽样，不插值、不补零。原表未提供通道单位。
      </p>
    </section>

    <section
      v-else-if="activeTab === 'stratigraphy' && presentation.stratigraphy"
      id="stratigraphy-research-panel"
      class="panel-content"
      role="tabpanel"
    >
      <div class="summary-grid">
        <div>
          <strong>{{ presentation.stratigraphy.summary.totalLayers }}</strong>
          <span>真实分层</span>
        </div>
        <div>
          <strong>{{ lithologyTypeCount }}</strong>
          <span>岩性类别</span>
        </div>
        <div>
          <strong>{{ presentation.stratigraphy.summary.depthRange.maximum }} m</strong>
          <span>孔底深度</span>
        </div>
      </div>

      <div class="data-warning">
        该岩性柱仅代表苏95单井；源数据存在
        {{ presentation.stratigraphy.summary.depthGapCount }} 处、共
        {{ presentation.stratigraphy.summary.totalGapThickness }} m 的原始间断，未作补齐。
      </div>

      <div
        ref="chartRef"
        class="research-chart"
        role="img"
        aria-label="苏95单井真实岩性柱，包含695条分层，深度0至3040米"
      ></div>

      <p class="source-note">
        颜色用于区分岩性类别，不等同于原始描述中的地质标准色。悬停可查看每层真实顶底深度与描述。
      </p>
    </section>
  </aside>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";

import {
  createAquiferResearchPresentation,
  type AquiferResearchTab,
} from "../utils/aquiferResearchPresentation";

const props = defineProps<{
  wellId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const presentation = computed(() =>
  createAquiferResearchPresentation(props.wellId)
);
const activeTab = ref<AquiferResearchTab>("log");
const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

const hasDeclaredRangeDifference = computed(() => {
  const log = presentation.value?.log;
  return Boolean(
    log &&
    (log.declaredDepthRange.minimum !== log.sourceDepthRange.minimum ||
      log.declaredDepthRange.maximum !== log.sourceDepthRange.maximum)
  );
});

const lithologyTypeCount = computed(() =>
  Object.keys(presentation.value?.stratigraphy?.summary.lithologyCounts ?? {})
    .length
);

function disposeChart() {
  resizeObserver?.disconnect();
  resizeObserver = null;
  chart?.dispose();
  chart = null;
}

function createLogOption(): echarts.EChartsOption {
  const log = presentation.value?.log;
  if (!log) return {};

  const count = log.channels.length;
  const gap = 2;
  const usableWidth = 86;
  const gridWidth = (usableWidth - gap * (count - 1)) / count;
  const grids = log.channels.map((_, index) => ({
    left: `${5 + index * (gridWidth + gap)}%`,
    width: `${gridWidth}%`,
    top: 56,
    bottom: 32,
    containLabel: index === 0,
  }));

  return {
    animation: false,
    backgroundColor: "transparent",
    aria: {
      enabled: true,
      description: `${log.wellId}井真实测井曲线，使用${log.visualizationSampleCount}个可视化抽样点，深度向下增加。`,
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(4, 15, 27, 0.96)",
      borderColor: "rgba(38, 217, 255, 0.45)",
      textStyle: { color: "#e8f7ff", fontSize: 11 },
      formatter: (params: any) => {
        const value = params.value as [number, number];
        return `${params.seriesName}<br>深度：${value[1]} m<br>数值：${value[0]}`;
      },
    },
    grid: grids,
    xAxis: log.channels.map((channel, index) => ({
      type: "value",
      gridIndex: index,
      position: "top",
      min: channel.minimum,
      max: channel.maximum,
      name: channel.label,
      nameLocation: "middle",
      nameGap: 28,
      nameTextStyle: { color: channel.color, fontSize: 11 },
      axisLine: { lineStyle: { color: "rgba(135, 200, 225, 0.3)" } },
      axisLabel: { color: "rgba(218, 240, 250, 0.65)", fontSize: 9 },
      splitLine: { lineStyle: { color: "rgba(38, 217, 255, 0.07)" } },
    })),
    yAxis: log.channels.map((_, index) => ({
      type: "value",
      gridIndex: index,
      inverse: true,
      min: log.sourceDepthRange.minimum,
      max: log.sourceDepthRange.maximum,
      name: index === 0 ? "深度 / m" : "",
      nameTextStyle: { color: "rgba(218, 240, 250, 0.7)", fontSize: 10 },
      axisLine: { show: index === 0, lineStyle: { color: "rgba(135, 200, 225, 0.3)" } },
      axisLabel: { show: index === 0, color: "rgba(218, 240, 250, 0.65)", fontSize: 9 },
      splitLine: { lineStyle: { color: "rgba(38, 217, 255, 0.07)" } },
    })),
    dataZoom: [
      {
        type: "inside",
        yAxisIndex: log.channels.map((_, index) => index),
        filterMode: "none",
      },
      {
        type: "slider",
        yAxisIndex: log.channels.map((_, index) => index),
        orient: "vertical",
        right: 4,
        top: 56,
        bottom: 32,
        width: 12,
        filterMode: "none",
        borderColor: "rgba(38, 217, 255, 0.2)",
        fillerColor: "rgba(38, 217, 255, 0.12)",
        handleStyle: { color: "#26d9ff" },
        textStyle: { color: "rgba(218, 240, 250, 0.6)", fontSize: 9 },
      },
    ],
    series: log.channels.map((channel, index) => ({
      name: channel.label,
      type: "line",
      xAxisIndex: index,
      yAxisIndex: index,
      data: channel.points.map(([value, depth]) => [value, depth]),
      showSymbol: false,
      connectNulls: false,
      lineStyle: { color: channel.color, width: 1.2 },
      emphasis: { lineStyle: { width: 2 } },
    })),
  };
}

function createStratigraphyOption(): echarts.EChartsOption {
  const stratigraphy = presentation.value?.stratigraphy;
  if (!stratigraphy) return {};

  const data = stratigraphy.layers.map((layer) => ({
    value: [0, layer.topDepth, layer.bottomDepth, layer.sourceRow],
    itemStyle: {
      color: layer.displayColor,
      borderColor: "rgba(4, 15, 27, 0.45)",
      borderWidth: 0.4,
    },
    layer,
  }));

  return {
    animation: false,
    backgroundColor: "transparent",
    aria: {
      enabled: true,
      description: "苏95单井真实岩性柱，包含695条分层，深度范围0至3040米。",
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(4, 15, 27, 0.96)",
      borderColor: "rgba(38, 217, 255, 0.45)",
      textStyle: { color: "#e8f7ff", fontSize: 11 },
      formatter: (params: any) => {
        const layer = params.data.layer;
        return [
          `<strong>${layer.lithology}</strong>`,
          `${layer.topDepth}–${layer.bottomDepth} m`,
          `厚度：${layer.thickness} m`,
          `描述：${layer.description}`,
          `源段代码：${layer.sourceSectionCode}`,
        ].join("<br>");
      },
    },
    grid: { left: 64, right: 48, top: 20, bottom: 24 },
    xAxis: {
      type: "value",
      min: 0,
      max: 1,
      show: false,
    },
    yAxis: {
      type: "value",
      inverse: true,
      min: stratigraphy.summary.depthRange.minimum,
      max: stratigraphy.summary.depthRange.maximum,
      name: "深度 / m",
      nameTextStyle: { color: "rgba(218, 240, 250, 0.7)", fontSize: 10 },
      axisLine: { show: true, lineStyle: { color: "rgba(135, 200, 225, 0.3)" } },
      axisLabel: { color: "rgba(218, 240, 250, 0.65)", fontSize: 9 },
      splitLine: { lineStyle: { color: "rgba(38, 217, 255, 0.07)" } },
    },
    dataZoom: [
      { type: "inside", yAxisIndex: 0, filterMode: "none" },
      {
        type: "slider",
        yAxisIndex: 0,
        orient: "vertical",
        right: 6,
        top: 20,
        bottom: 24,
        width: 12,
        filterMode: "none",
        borderColor: "rgba(38, 217, 255, 0.2)",
        fillerColor: "rgba(38, 217, 255, 0.12)",
        handleStyle: { color: "#26d9ff" },
        textStyle: { color: "rgba(218, 240, 250, 0.6)", fontSize: 9 },
      },
    ],
    series: [
      {
        name: "苏95岩性",
        type: "custom",
        renderItem: (params: any, api: any) => {
          const top = api.coord([0, api.value(1)]);
          const bottom = api.coord([1, api.value(2)]);
          const shape = echarts.graphic.clipRectByRect(
            {
              x: top[0],
              y: top[1],
              width: bottom[0] - top[0],
              height: Math.max(0.6, bottom[1] - top[1]),
            },
            params.coordSys
          );
          return shape
            ? { type: "rect", shape, style: api.style() }
            : undefined;
        },
        encode: { y: [1, 2] },
        data,
      },
    ],
  };
}

async function renderChart() {
  await nextTick();
  if (!chartRef.value || !presentation.value) return;

  disposeChart();
  chart = echarts.init(chartRef.value);
  chart.setOption(
    activeTab.value === "log"
      ? createLogOption()
      : createStratigraphyOption()
  );
  resizeObserver = new ResizeObserver(() => chart?.resize());
  resizeObserver.observe(chartRef.value);
}

watch(
  () => props.wellId,
  () => {
    activeTab.value = presentation.value?.availableTabs[0] ?? "log";
    void renderChart();
  },
  { immediate: true }
);

watch(activeTab, () => {
  void renderChart();
});

onBeforeUnmount(disposeChart);
</script>

<style scoped>
.research-panel {
  position: absolute;
  z-index: 180;
  top: 92px;
  right: 24px;
  bottom: 24px;
  width: min(760px, calc(100vw - 48px));
  display: flex;
  flex-direction: column;
  color: #e8f7ff;
  background: rgba(3, 14, 26, 0.94);
  border: 1px solid rgba(38, 217, 255, 0.5);
  border-radius: 8px;
  box-shadow: 0 14px 48px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 18px 12px;
  border-bottom: 1px solid rgba(38, 217, 255, 0.18);
  background: linear-gradient(90deg, rgba(38, 217, 255, 0.1), transparent 68%);
}

.panel-eyebrow {
  margin-bottom: 3px;
  color: #65f6c5;
  font-family: "Courier New", monospace;
  font-size: 10px;
  letter-spacing: 2px;
}

.panel-header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 20px;
}

.panel-close {
  width: 32px;
  height: 32px;
  color: #8acfe7;
  font-size: 24px;
  line-height: 1;
  background: rgba(38, 217, 255, 0.06);
  border: 1px solid rgba(38, 217, 255, 0.25);
  border-radius: 4px;
  cursor: pointer;
}

.panel-close:hover {
  color: #ffffff;
  border-color: #26d9ff;
}

.panel-tabs {
  display: flex;
  gap: 8px;
  padding: 10px 18px 0;
}

.panel-tabs button {
  padding: 7px 14px;
  color: #7fa8ba;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.panel-tabs button.active {
  color: #26d9ff;
  border-bottom-color: #26d9ff;
}

.scope-note {
  margin: 8px 18px 0;
  color: #7497a6;
  font-size: 10px;
  line-height: 1.45;
}

.panel-content {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 18px 14px;
  overflow-y: auto;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.summary-grid > div {
  padding: 8px 10px;
  background: rgba(38, 217, 255, 0.045);
  border-left: 2px solid rgba(38, 217, 255, 0.42);
}

.summary-grid strong,
.summary-grid span {
  display: block;
}

.summary-grid strong {
  color: #ffffff;
  font-family: "Courier New", monospace;
  font-size: 14px;
}

.summary-grid span {
  margin-top: 3px;
  color: #6f9bad;
  font-size: 10px;
}

.data-warning {
  margin-top: 9px;
  padding: 7px 9px;
  color: #d9bd75;
  font-size: 11px;
  line-height: 1.5;
  background: rgba(217, 189, 117, 0.07);
  border: 1px solid rgba(217, 189, 117, 0.2);
}

.channel-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
}

.channel-strip span {
  padding: 3px 7px;
  color: var(--channel-color);
  font-size: 10px;
  border: 1px solid color-mix(in srgb, var(--channel-color) 45%, transparent);
  border-radius: 3px;
}

.research-chart {
  min-height: 300px;
  flex: 1;
  margin-top: 8px;
}

.source-note {
  margin: 6px 0 0;
  color: #668b9b;
  font-size: 10px;
  line-height: 1.5;
}

@media screen and (max-width: 768px) {
  .research-panel {
    top: 84px;
    right: 12px;
    bottom: 12px;
    width: calc(100vw - 24px);
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .research-chart {
    min-height: 240px;
  }
}
</style>
