<template>
  <div class="metadata-popup-overlay" v-if="visible" @click.self="closePopup">
    <div class="metadata-popup">
      <div class="popup-header">
        <h3>{{ title }}</h3>
        <button class="metadata-close-btn" @click="closePopup">×</button>
      </div>

      <div class="popup-content">
        <!-- 精度信息内容 -->
        <div v-if="type === 'precision'" class="info-grid">
          <div class="info-item">
            <div class="info-label">数据源</div>
            <div class="info-value">含水层地质勘探数据 (2025年)</div>
          </div>
          <div class="info-item">
            <div class="info-label">处理算法</div>
            <div class="info-value">多尺度高斯滤波 + 三维重构</div>
          </div>
          <div class="info-item">
            <div class="info-label">垂直精度</div>
            <div class="info-value">±0.15米</div>
          </div>
          <div class="info-item">
            <div class="info-label">水平精度</div>
            <div class="info-value">±0.2米</div>
          </div>
          <div class="info-item">
            <div class="info-label">有效分辨率</div>
            <div class="info-value">0.5米（主要区域）至1米（边缘区域）</div>
          </div>
          <!-- 进度条区域 -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-title">数据精度评估</span>
              <span class="progress-value">92%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 92%"></div>
            </div>
            <div class="progress-labels">
              <span>低</span>
              <span>中</span>
              <span>高</span>
            </div>
          </div>
        </div>

        <!-- 几何信息内容 -->
        <div v-if="type === 'geometry'" class="geometry-grid">
          <!-- 1. 模型信息 -->
          <div class="geometry-item">
            <div class="geometry-label">模型信息</div>
            <div class="geometry-value">
              存储格式: GLB<br />
              网格数: 1<br />
              图元数: 1
            </div>
          </div>
          <!-- 2. 几何信息 -->
          <div class="geometry-item">
            <div class="geometry-label">几何信息</div>
            <div class="geometry-value">
              总顶点数: 125,430<br />
              总三角面数: 248,860<br />
              总索引数: 746,580<br />
              每三角形顶点数: 3<br />
              缩放系数: 1.0<br />
              包围盒(min): [0.000, 0.000, -800.000]<br />
              包围盒(max): [1500.000, 1200.000, -200.000]
            </div>
          </div>
          <!-- 3. 压缩信息 -->
          <div class="geometry-item">
            <div class="geometry-label">压缩信息</div>
            <div class="geometry-value">
              压缩算法: Draco<br />
              压缩率: 8.5:1
            </div>
          </div>
          <!-- 4. 材质与纹理 -->
          <div class="geometry-item">
            <div class="geometry-label">材质与纹理</div>
            <div class="geometry-value">
              材质数: 1<br />
              含纹理材质数: 1<br />
              含法线贴图材质数: 0<br />
              纹理数: 1<br />
              图片数: 1
            </div>
          </div>
          <!-- 5. 模型密度 -->
          <div class="geometry-item">
            <div class="geometry-label">模型密度</div>
            <div class="geometry-value">
              模型体积: 1.08e+8 m³<br />
              顶点密度: 0.0011 /m³<br />
              三角面密度: 0.0023 /m³
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const title = ref('');
const type = ref<'precision' | 'geometry'>('precision');

const open = (popupType: 'precision' | 'geometry') => {
  type.value = popupType;
  title.value = popupType === 'precision' ? '模型精度信息' : '模型几何信息';
  visible.value = true;
};

const closePopup = () => {
  visible.value = false;
};

defineExpose({
  open
});
</script>

<style scoped lang="scss">
.metadata-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.metadata-popup {
  width: 400px;
  max-height: 80vh;
  background: rgba(16, 29, 41, 0.95);
  border: 1px solid rgba(23, 199, 254, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  padding: 20px;
  animation: zoomIn 0.3s ease;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(23, 199, 254, 0.2);
  padding-bottom: 10px;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #17c7fe;
    font-weight: 500;
  }

  .metadata-close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #17c7fe;
    cursor: pointer;
    line-height: 1;

    &:hover {
      color: #fff;
    }
  }
}

.popup-content {
  overflow-y: auto;
  flex: 1;
  padding-right: 5px;

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(23, 199, 254, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(23, 199, 254, 0.5);
    }
  }
}

/* 复用 MetadataPanel 的样式并适当调整 */
.info-grid,
.geometry-grid {
  display: grid;
  gap: 12px;
}

.info-item,
.geometry-item {
  background: rgba(23, 199, 254, 0.05);
  border: 1px solid rgba(23, 199, 254, 0.1);
  border-radius: 6px;
  padding: 10px 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(23, 199, 254, 0.1);
    border-color: rgba(23, 199, 254, 0.3);
  }
}

.info-label,
.geometry-label {
  color: #17c7fe;
  font-weight: 500;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-value,
.geometry-value {
  color: #e0e0e0;
  font-size: 13px;
  line-height: 1.5;
  font-family: "Courier New", monospace;
}

.progress-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(23, 199, 254, 0.2);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-title {
  color: #17c7fe;
  font-weight: 500;
  font-size: 13px;
}

.progress-value {
  color: #e0e0e0;
  font-size: 13px;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(23, 199, 254, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #17c7fe, #0fa8d4);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(23, 199, 254, 0.4);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8a9ba8;
}

@keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
