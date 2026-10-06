<template>
  <Teleport to="body">
    <Transition name="coverage-fade">
      <div
        v-if="visible"
        class="coverage-overlay"
        @click.self="emit('close')"
      >
        <div class="coverage-modal">
          <div class="coverage-header">
            <div class="coverage-heading">
              <h3 class="coverage-title">{{ title }}</h3>
              <p class="coverage-subtitle">{{ subtitle }}</p>
            </div>
            <button
              class="coverage-close"
              aria-label="关闭"
              @click="emit('close')"
            >
              ×
            </button>
          </div>

          <div class="coverage-body">
            <section class="coverage-hero" :class="{ ok: isPass }">
              <div class="hero-rate">
                <div class="hero-value">
                  <span class="hero-number">{{ finalRate }}</span>
                  <span class="hero-unit">%</span>
                </div>
                <div class="hero-caption">{{ finalRateLabel }}</div>
              </div>
              <div class="hero-main">
                <div class="hero-badges">
                  <span
                    class="badge"
                    :class="isPass ? 'badge-ok' : 'badge-fail'"
                  >
                    {{ isPass ? "达标" : "未达标" }}
                  </span>
                  <span class="hero-target">
                    考核指标：数字孪生覆盖可视化区域 ≥ {{ targetRate }}%
                  </span>
                </div>
                <div class="hero-bar">
                  <div
                    class="hero-bar-fill"
                    :style="{ width: barWidth + '%' }"
                  ></div>
                  <div
                    class="hero-bar-mark"
                    :style="{ left: targetRate + '%' }"
                  >
                    <span>{{ targetRate }}%</span>
                  </div>
                </div>
                <p class="hero-formula">{{ formula }}</p>
              </div>
            </section>

            <section v-if="chips.length" class="coverage-chips">
              <div v-for="chip in chips" :key="chip.label" class="chip">
                <span class="chip-label">{{ chip.label }}</span>
                <span class="chip-value">{{ chip.value }}</span>
              </div>
            </section>

            <section
              v-if="matrixRows && matrixRows.length"
              class="coverage-section"
            >
              <h4 class="section-title">{{ matrixTitle }}</h4>
              <div class="table-scroll">
                <table class="cov-table">
                  <thead>
                    <tr>
                      <th class="col-name">{{ matrixNameLabel }}</th>
                      <th v-for="col in checkColumns" :key="col">
                        {{ col }}
                      </th>
                      <th class="col-name">综合判定</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in matrixRows" :key="row.name">
                      <td class="col-name">{{ row.name }}</td>
                      <td v-for="(check, i) in row.checks" :key="i">
                        <span
                          class="dot"
                          :class="check === 1 ? 'dot-ok' : 'dot-fail'"
                        >
                          {{ check === 1 ? "✓" : "✕" }}
                        </span>
                      </td>
                      <td class="col-name">
                        <span
                          class="row-verdict"
                          :class="rowCovered(row) ? 'ok' : 'fail'"
                        >
                          {{ rowCovered(row) ? "已覆盖" : "未覆盖" }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section v-if="stages && stages.length" class="coverage-section">
              <h4 class="section-title">数据处理环节通过率</h4>
              <table class="cov-table">
                <thead>
                  <tr>
                    <th>环节编号</th>
                    <th class="col-name">处理环节</th>
                    <th>通过数</th>
                    <th>总数</th>
                    <th>通过率 P<sub>k</sub></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="stage in stages" :key="stage.code">
                    <td>{{ stage.code }}</td>
                    <td class="col-name">{{ stage.name }}</td>
                    <td>{{ stage.passed }}</td>
                    <td>{{ stage.total }}</td>
                    <td
                      class="rate-cell"
                      :class="{ ok: stage.passed === stage.total }"
                    >
                      {{ stageRate(stage) }}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section
              v-if="tableRows && tableRows.length"
              class="coverage-section"
            >
              <h4 class="section-title">{{ tableTitle }}</h4>
              <table class="cov-table">
                <thead>
                  <tr>
                    <th
                      v-for="col in tableColumns"
                      :key="col"
                      :class="{ 'col-name': col === tableColumns?.[0] }"
                    >
                      {{ col }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in tableRows"
                    :key="row.name"
                    :class="{ highlight: row.highlight }"
                  >
                    <td class="col-name">{{ row.name }}</td>
                    <td
                      v-for="(cell, i) in row.cells"
                      :key="i"
                      :class="{
                        'rate-cell': i === row.cells.length - 1,
                        ok: row.highlight && i === row.cells.length - 1,
                      }"
                    >
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <div class="coverage-notes">
            <p v-for="(note, i) in notes" :key="i">
              注{{ notes.length > 1 ? i + 1 : "" }}：{{ note }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  CoverageMatrixRow,
  CoverageStage,
  CoverageStatsData,
} from "@/data/coverageStats";

const props = defineProps<CoverageStatsData & { visible: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const isPass = computed(() => props.finalRate >= props.targetRate);
const barWidth = computed(() => Math.min(props.finalRate, 100));

const rowCovered = (row: CoverageMatrixRow) => row.checks.every((c) => c === 1);

/** 通过率 = 通过数 / 总数 × 100%，界面自动统计 */
const stageRate = (stage: CoverageStage) => {
  const value = (stage.passed / stage.total) * 100;
  return value.toFixed(2).replace(/\.?0+$/, "");
};
</script>

<style lang="scss" scoped>
.coverage-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 8, 16, 0.72);
  backdrop-filter: blur(4px);
}

.coverage-modal {
  display: flex;
  flex-direction: column;
  width: 820px;
  max-width: calc(100vw - 48px);
  max-height: 88vh;
  color: #cfeaff;
  background: linear-gradient(
    180deg,
    rgba(8, 26, 44, 0.97),
    rgba(5, 16, 28, 0.97)
  );
  border: 1px solid rgba(95, 200, 255, 0.35);
  border-radius: 10px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.55);
}

.coverage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px 12px;
  border-bottom: 1px solid rgba(95, 200, 255, 0.22);
}

.coverage-heading {
  .coverage-title {
    margin: 0;
    font-family: Douyu, sans-serif;
    font-size: 19px;
    letter-spacing: 2px;
    color: #5fc8ff;
  }

  .coverage-subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    letter-spacing: 1px;
    color: #7ea7c4;
  }
}

.coverage-close {
  width: 32px;
  height: 32px;
  font-size: 20px;
  line-height: 1;
  color: #9ec5e0;
  background: rgba(20, 50, 80, 0.6);
  border: 1px solid rgba(95, 200, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background: rgba(95, 200, 255, 0.25);
  }
}

.coverage-body {
  flex: 1;
  padding: 16px 22px 8px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(95, 200, 255, 0.25);
    border-radius: 3px;
  }
}

.coverage-hero {
  display: flex;
  gap: 26px;
  align-items: center;
  padding: 14px 18px;
  background: rgba(95, 200, 255, 0.05);
  border: 1px solid rgba(95, 200, 255, 0.18);
  border-radius: 8px;

  .hero-rate {
    min-width: 170px;
    text-align: center;

    .hero-value {
      font-family: Douyu, sans-serif;
      color: #ff7a8a;
    }

    .hero-number {
      font-size: 52px;
      line-height: 1;
    }

    .hero-unit {
      margin-left: 4px;
      font-size: 20px;
    }

    .hero-caption {
      margin-top: 6px;
      font-size: 12px;
      letter-spacing: 2px;
      color: #7ea7c4;
    }
  }

  &.ok .hero-rate .hero-value {
    color: #65f6c5;
  }

  .hero-main {
    flex: 1;
    min-width: 0;
  }

  .hero-badges {
    display: flex;
    gap: 12px;
    align-items: center;

    .badge {
      padding: 3px 12px;
      font-size: 13px;
      letter-spacing: 2px;
      border-radius: 3px;
    }

    .badge-ok {
      color: #04121a;
      font-weight: 600;
      background: #65f6c5;
    }

    .badge-fail {
      color: #fff;
      background: rgba(255, 122, 138, 0.85);
    }

    .hero-target {
      font-size: 12px;
      letter-spacing: 1px;
      color: #9ec5e0;
    }
  }

  .hero-bar {
    position: relative;
    height: 14px;
    margin-top: 26px;
    background: rgba(95, 200, 255, 0.12);
    border-radius: 7px;

    .hero-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #5fc8ff, #65f6c5);
      border-radius: 7px;
      transition: width 0.4s ease;
    }

    .hero-bar-mark {
      position: absolute;
      top: -14px;
      bottom: -4px;
      width: 0;
      border-left: 2px dashed #f1bd49;

      span {
        position: absolute;
        top: -4px;
        left: 6px;
        font-size: 11px;
        white-space: nowrap;
        color: #f1bd49;
      }
    }
  }

  .hero-formula {
    margin: 14px 0 0;
    font-size: 12px;
    letter-spacing: 0.5px;
    color: #7ea7c4;
  }
}

.coverage-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;

  .chip {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 14px;
    background: rgba(95, 200, 255, 0.07);
    border: 1px solid rgba(95, 200, 255, 0.22);
    border-radius: 6px;

    .chip-label {
      font-size: 11px;
      letter-spacing: 1px;
      color: #6f95b3;
    }

    .chip-value {
      font-size: 13px;
      color: #d4f7ff;
    }
  }
}

.coverage-section {
  margin-top: 16px;

  .section-title {
    margin: 0 0 8px;
    padding-left: 8px;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 1px;
    color: #5fc8ff;
    border-left: 3px solid #5fc8ff;
  }
}

.table-scroll {
  overflow-x: auto;
}

.cov-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;

  th {
    padding: 7px 8px;
    font-weight: 500;
    color: #9ec5e0;
    text-align: center;
    background: rgba(20, 50, 80, 0.55);
    border-bottom: 1px solid rgba(95, 200, 255, 0.3);
    white-space: nowrap;
  }

  td {
    padding: 6px 8px;
    color: #cfeaff;
    text-align: center;
    border-bottom: 1px solid rgba(95, 200, 255, 0.12);
    white-space: nowrap;
  }

  .col-name {
    text-align: left;
  }

  .dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 12px;
    border-radius: 3px;
  }

  .dot-ok {
    color: #65f6c5;
    background: rgba(101, 246, 197, 0.16);
    border: 1px solid rgba(101, 246, 197, 0.35);
  }

  .dot-fail {
    color: #ff7a8a;
    background: rgba(255, 122, 138, 0.14);
    border: 1px solid rgba(255, 122, 138, 0.4);
  }

  .row-verdict {
    &.ok {
      color: #65f6c5;
    }

    &.fail {
      color: #ff7a8a;
    }
  }

  .rate-cell {
    font-weight: 600;
    color: #d4f7ff;

    &.ok {
      color: #65f6c5;
    }
  }

  tr.highlight {
    background: rgba(101, 246, 197, 0.07);
  }
}

.coverage-notes {
  padding: 10px 22px 14px;
  font-size: 11.5px;
  line-height: 1.7;
  color: #7ea7c4;
  background: rgba(4, 12, 22, 0.6);
  border-top: 1px solid rgba(95, 200, 255, 0.18);
  border-radius: 0 0 10px 10px;

  p {
    margin: 2px 0;
  }
}

.coverage-fade-enter-active,
.coverage-fade-leave-active {
  transition: opacity 0.25s ease;
}

.coverage-fade-enter-active .coverage-modal,
.coverage-fade-leave-active .coverage-modal {
  transition: transform 0.25s ease;
}

.coverage-fade-enter-from,
.coverage-fade-leave-to {
  opacity: 0;
}

.coverage-fade-enter-from .coverage-modal,
.coverage-fade-leave-to .coverage-modal {
  transform: translateY(-14px);
}
</style>
