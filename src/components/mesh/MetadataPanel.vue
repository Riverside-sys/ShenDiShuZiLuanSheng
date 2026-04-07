<template>
    <div class="metadata-panel" v-if="showMetadata">
        <div class="metadata-header">
            <h3>数据元信息</h3>
            <button class="close-btn" @click="toggleMetadata">×</button>
        </div>
        <div class="metadata-content">
            <div class="metadata-item">
                <span class="label">数据源:</span>
                <span class="value">{{ metadata.dataSource }}</span>
            </div>
            <div class="metadata-item">
                <span class="label">处理算法:</span>
                <span class="value">{{ metadata.algorithm }}</span>
            </div>
            <div class="metadata-item">
                <span class="label">垂直精度:</span>
                <span class="value">{{ metadata.verticalAccuracy }}</span>
            </div>
            <div class="metadata-item">
                <span class="label">水平精度:</span>
                <span class="value">{{ metadata.horizontalAccuracy }}</span>
            </div>
            <div class="metadata-item">
                <span class="label">有效分辨率:</span>
                <span class="value">{{ metadata.resolution }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "MetadataPanel",
    props: {
        showMetadata: {
            type: Boolean,
            default: true,
        },
        metadata: {
            type: Object,
            default: () => ({
                dataSource: "LiDAR 点云 (2024年采集)",
                algorithm: "多尺度高斯滤波 + 三维重构",
                verticalAccuracy: "±0.15米",
                horizontalAccuracy: "±0.2米",
                resolution: "0.5米（主要区域）至1米（边缘区域）",
            }),
        },
    },
    methods: {
        toggleMetadata() {
            this.$emit("update:showMetadata", !this.showMetadata);
        },
    },
};
</script>

<style scoped>
.metadata-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    min-width: 300px;
    z-index: 1000;
}

.metadata-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
}

.metadata-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #666;
    cursor: pointer;
    padding: 0 4px;
}

.close-btn:hover {
    color: #333;
}

.metadata-content {
    font-size: 14px;
}

.metadata-item {
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
}

.metadata-item .label {
    color: #666;
    font-weight: 500;
}

.metadata-item .value {
    color: #333;
    text-align: right;
}
</style>
