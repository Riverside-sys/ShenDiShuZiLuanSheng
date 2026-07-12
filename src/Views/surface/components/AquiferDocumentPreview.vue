<template>
  <div
    v-if="document"
    class="document-preview-overlay"
    @click.self="emit('close')"
  >
    <div class="document-preview-panel">
      <header class="document-preview-header">
        <div>
          <h3>{{ document.title }}</h3>
          <p>{{ document.sourceNote }}</p>
        </div>
        <button type="button" class="document-close-btn" @click="emit('close')">×</button>
      </header>
      <div class="document-preview-body">
        <img :src="document.url" :alt="document.title" class="document-preview-img" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AquiferWellDocument } from "@/data/aquifer/documents";

defineProps<{
  document: AquiferWellDocument;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<style scoped>
.document-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(2px);
}

.document-preview-panel {
  display: flex;
  flex-direction: column;
  width: min(760px, calc(100vw - 24px));
  max-height: calc(100vh - 24px);
  overflow: hidden;
  color: #e8f7ff;
  background: rgba(8, 18, 32, 0.96);
  border: 1px solid rgba(38, 217, 255, 0.45);
  border-radius: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
}

.document-preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(38, 217, 255, 0.18);
}

.document-preview-header h3 {
  margin: 0;
  color: #26d9ff;
  font-size: 16px;
}

.document-preview-header p {
  margin: 6px 0 0;
  color: #8bb3c4;
  font-size: 11px;
  line-height: 1.5;
}

.document-close-btn {
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

.document-close-btn:hover {
  color: #fff;
  border-color: #26d9ff;
}

.document-preview-body {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: rgba(0, 0, 0, 0.25);
}

.document-preview-img {
  display: block;
  width: 100%;
  height: auto;
}
</style>
