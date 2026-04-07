<!-- 模型信息面板 -->
<template>
    <div class="metadata-panel" v-if="showMetadata">
        <div class="metadata-header">
            <h3>{{ panelTitle }}</h3>
            <button class="close-btn" @click="toggleMetadata">×</button>
        </div>

        <!-- 标签页切换 -->
        <div class="tab-container">
            <div
                class="tab-item"
                :class="{ active: activeTab === 'accuracy' }"
                @click="activeTab = 'accuracy'"
            >
                模型精度信息
            </div>
            <div
                class="tab-item"
                :class="{ active: activeTab === 'geometry' }"
                @click="activeTab = 'geometry'"
            >
                模型几何信息
            </div>
        </div>

        <!-- 精度信息内容 -->
        <div v-if="activeTab === 'accuracy'" class="tab-content">
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">数据源</div>
                    <div class="info-value">{{ metadata.dataSource }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">处理算法</div>
                    <div class="info-value">{{ metadata.algorithm }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">垂直精度</div>
                    <div class="info-value">
                        {{ metadata.verticalAccuracy }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">水平精度</div>
                    <div class="info-value">
                        {{ metadata.horizontalAccuracy }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">有效分辨率</div>
                    <div class="info-value">{{ metadata.resolution }}</div>
                </div>
            </div>

            <!-- 进度条区域 -->
            <div class="progress-section">
                <div class="progress-header">
                    <span class="progress-title">数据精度评估</span>
                    <span class="progress-value">{{ accuracyScore }}%</span>
                </div>
                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{ width: accuracyScore + '%' }"
                    ></div>
                </div>
                <div class="progress-labels">
                    <span>低</span>
                    <span>中</span>
                    <span>高</span>
                </div>
            </div>
        </div>

        <!-- 几何信息内容 -->
        <div v-if="activeTab === 'geometry'" class="tab-content">
            <div v-if="modelInfo" class="geometry-grid">
                <!-- 1. 模型信息 -->
                <div class="geometry-item">
                    <div class="geometry-label">模型信息</div>
                    <div class="geometry-value">
                        存储格式: {{ modelInfo.file_info?.gltf_version || "—"
                        }}<br />
                        网格数: {{ modelInfo.file_info?.mesh_count ?? "—"
                        }}<br />
                        图元数:
                        {{ modelInfo.file_info?.primitive_count ?? "—" }}
                    </div>
                </div>
                <!-- 2. 几何信息 -->
                <div class="geometry-item">
                    <div class="geometry-label">几何信息</div>
                    <div class="geometry-value">
                        总顶点数:
                        {{ modelInfo.geometry_precision?.total_vertices ?? "—"
                        }}<br />
                        总三角面数:
                        {{ modelInfo.geometry_precision?.total_triangles ?? "—"
                        }}<br />
                        总索引数:
                        {{ modelInfo.geometry_precision?.total_indices ?? "—"
                        }}<br />
                        每三角形顶点数:
                        {{
                            modelInfo.geometry_precision
                                ?.vertices_per_triangle ?? "—"
                        }}<br />
                        缩放系数:
                        {{ modelInfo.geometry_precision?.scale_factor ?? "—"
                        }}<br />
                        包围盒(min):
                        <span
                            v-if="
                                modelInfo.geometry_precision?.bounding_box &&
                                modelInfo.geometry_precision?.scale_factor
                            "
                        >
                            [
                            {{
                                (
                                    modelInfo.geometry_precision.bounding_box
                                        .min[0] *
                                    modelInfo.geometry_precision.scale_factor
                                ).toFixed(3)
                            }},
                            {{
                                (
                                    modelInfo.geometry_precision.bounding_box
                                        .min[1] *
                                    modelInfo.geometry_precision.scale_factor
                                ).toFixed(3)
                            }},
                            {{
                                (
                                    modelInfo.geometry_precision.bounding_box
                                        .min[2] *
                                    modelInfo.geometry_precision.scale_factor
                                ).toFixed(3)
                            }}
                            ]
                        </span>
                        <span v-else>—</span><br />
                        包围盒(max):
                        <span
                            v-if="
                                modelInfo.geometry_precision?.bounding_box &&
                                modelInfo.geometry_precision?.scale_factor
                            "
                        >
                            [
                            {{
                                (
                                    modelInfo.geometry_precision.bounding_box
                                        .max[0] *
                                    modelInfo.geometry_precision.scale_factor
                                ).toFixed(3)
                            }},
                            {{
                                (
                                    modelInfo.geometry_precision.bounding_box
                                        .max[1] *
                                    modelInfo.geometry_precision.scale_factor
                                ).toFixed(3)
                            }},
                            {{
                                (
                                    modelInfo.geometry_precision.bounding_box
                                        .max[2] *
                                    modelInfo.geometry_precision.scale_factor
                                ).toFixed(3)
                            }}
                            ]
                        </span>
                        <span v-else>—</span>
                    </div>
                </div>
                <!-- 3. 压缩信息 -->
                <div class="geometry-item">
                    <div class="geometry-label">压缩信息</div>
                    <div class="geometry-value">
                        压缩算法:
                        {{
                            modelInfo.compression_info?.draco_compression
                                ? "Draco"
                                : "无"
                        }}<br />
                        压缩率:
                        {{
                            modelInfo.compression_info?.compression_ratio ?? "—"
                        }}
                    </div>
                </div>
                <!-- 4. 材质与纹理 -->
                <div class="geometry-item">
                    <div class="geometry-label">材质与纹理</div>
                    <div class="geometry-value">
                        材质数:
                        {{ modelInfo.material_complexity?.material_count ?? "—"
                        }}<br />
                        含纹理材质数:
                        {{
                            modelInfo.material_complexity
                                ?.materials_with_textures ?? "—"
                        }}<br />
                        含法线贴图材质数:
                        {{
                            modelInfo.material_complexity
                                ?.materials_with_normal_maps ?? "—"
                        }}<br />
                        纹理数: {{ modelInfo.texture_info?.texture_count ?? "—"
                        }}<br />
                        图片数: {{ modelInfo.texture_info?.image_count ?? "—" }}
                    </div>
                </div>
                <!-- 5. 模型密度 -->
                <div class="geometry-item">
                    <div class="geometry-label">模型密度</div>
                    <div class="geometry-value">
                        模型体积:
                        {{ modelInfo.model_density?.model_volume ?? "—" }}<br />
                        顶点密度:
                        {{ modelInfo.model_density?.vertex_density ?? "—"
                        }}<br />
                        三角面密度:
                        {{ modelInfo.model_density?.triangle_density ?? "—" }}
                    </div>
                </div>
            </div>
            <div v-else class="no-data">
                <div class="no-data-icon">📄</div>
                <div class="no-data-text">暂无几何数据</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
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
    modelInfoPath: {
        type: String,
        default: "",
    },
    panelTitle: {
        type: String,
        default: "数据元信息",
    },
});

const emit = defineEmits(["update:showMetadata"]);

const modelInfo = ref("");
const activeTab = ref("accuracy"); // 默认显示精度信息
const accuracyScore = ref(90); // 精度评分，可以根据实际数据计算

const toggleMetadata = () => {
    emit("update:showMetadata", !props.showMetadata);
};

// 解析几何信息
const getVertexCoordinates = (info) => {
    if (!info || !info.meshes || !info.meshes[0]) return "暂无数据";

    const mesh = info.meshes[0];
    const primitive = mesh.primitives[0];
    const vertices = primitive.vertices;

    if (!vertices || !vertices.random_10_coordinates) return "暂无顶点数据";

    // 显示前10个顶点坐标
    const coordinates = vertices.random_10_coordinates.map((coord, index) => {
        return `${index}: (${coord[0].toFixed(6)}, ${coord[1].toFixed(
            6
        )}, ${coord[2].toFixed(6)})`;
    });

    return coordinates.join("\n");
};

const getFaceInfo = (info) => {
    if (!info || !info.meshes || !info.meshes[0]) return "暂无数据";

    const mesh = info.meshes[0];
    const primitive = mesh.primitives[0];
    const faces = primitive.faces;

    if (!faces || !faces.random_30_indices) return "暂无面数据";

    return `共 ${faces.total_count} 个面索引`;
};

const getModelStats = (info) => {
    if (!info || !info.meshes || !info.meshes[0]) return "暂无数据";

    const mesh = info.meshes[0];
    const primitive = mesh.primitives[0];
    const vertices = primitive.vertices;
    const faces = primitive.faces;

    const vertexCount = vertices ? vertices.total_count : 0;
    const faceCount = faces ? faces.total_count : 0;

    return `顶点: ${vertexCount.toLocaleString()} 个, 面: ${faceCount.toLocaleString()} 个`;
};

// 加载模型信息文件
const loadModelInfo = async (path) => {
    if (!path) return;

    try {
        const response = await fetch(path);
        if (response.ok) {
            const jsonData = await response.json();
            modelInfo.value = jsonData;
        } else {
            console.warn(`无法加载模型信息文件: ${path}`);
        }
    } catch (error) {
        console.error(`加载模型信息文件失败: ${path}`, error);
    }
};

// 监听 modelInfoPath 变化
watch(
    () => props.modelInfoPath,
    (newPath) => {
        if (newPath) {
            loadModelInfo(newPath);
        }
    },
    { immediate: true }
);

onMounted(() => {
    if (props.modelInfoPath) {
        loadModelInfo(props.modelInfoPath);
    }
});
</script>

<style scoped>
.metadata-panel {
    position: absolute;
    top: 280px;
    right: 20px;
    background: rgba(16, 29, 41, 0.95);
    border: 1px solid rgba(23, 199, 254, 0.3);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    padding: 16px;
    width: 320px;
    height: 400px;
    z-index: 1000;
    pointer-events: auto;
    overflow-y: auto;
}

.metadata-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(23, 199, 254, 0.2);
    padding-bottom: 8px;
}

.metadata-header h3 {
    margin: 0;
    font-size: 16px;
    color: #17c7fe;
    font-weight: 500;
}

.close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #17c7fe;
    cursor: pointer;
    padding: 0 4px;
    pointer-events: auto;
}

.close-btn:hover {
    color: #0fa8d4;
}

/* 标签页样式 */
.tab-container {
    display: flex;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(23, 199, 254, 0.2);
}

.tab-item {
    flex: 1;
    padding: 8px 12px;
    text-align: center;
    color: #8a9ba8;
    font-size: 13px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
}

.tab-item:hover {
    color: #17c7fe;
    background: rgba(23, 199, 254, 0.1);
}

.tab-item.active {
    color: #17c7fe;
    border-bottom-color: #17c7fe;
    background: rgba(23, 199, 254, 0.1);
}

/* 内容区域样式 */
.tab-content {
    pointer-events: auto;
    user-select: text;
}

/* 信息网格样式 */
.info-grid {
    display: grid;
    gap: 12px;
}

.info-item {
    background: rgba(23, 199, 254, 0.05);
    border: 1px solid rgba(23, 199, 254, 0.1);
    border-radius: 6px;
    padding: 10px 12px;
    transition: all 0.3s ease;
}

.info-item:hover {
    background: rgba(23, 199, 254, 0.1);
    border-color: rgba(23, 199, 254, 0.3);
}

.info-label {
    color: #17c7fe;
    font-weight: 500;
    font-size: 12px;
    margin-bottom: 4px;
}

.info-value {
    color: #e0e0e0;
    font-size: 13px;
    line-height: 1.4;
}

/* 几何信息样式 */
.geometry-grid {
    display: grid;
    gap: 12px;
}

.geometry-item {
    background: rgba(23, 199, 254, 0.05);
    border: 1px solid rgba(23, 199, 254, 0.1);
    border-radius: 6px;
    padding: 10px 12px;
    transition: all 0.3s ease;
}

.geometry-item:hover {
    background: rgba(23, 199, 254, 0.1);
    border-color: rgba(23, 199, 254, 0.3);
}

.geometry-label {
    color: #17c7fe;
    font-weight: 500;
    font-size: 12px;
    margin-bottom: 4px;
}

.geometry-value {
    color: #e0e0e0;
    font-size: 13px;
    line-height: 1.4;
    font-family: "Courier New", monospace;
}

.vertex-list {
    max-height: 150px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.2);
    padding: 8px;
    border-radius: 4px;
    font-size: 11px;
}

/* 进度条样式 */
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

/* 无数据状态 */
.no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #8a9ba8;
}

.no-data-icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.no-data-text {
    font-size: 14px;
}
</style>
