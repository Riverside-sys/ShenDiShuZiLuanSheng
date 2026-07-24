<!-- 高斯泼溅巷道场景 -->
<template>
    <div class="mine-gsplat-viewer">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-content">
                <div class="spinner"></div>
                <p>{{ loadingMessage }}</p>
            </div>
        </div>

        <!-- 错误状态 -->
        <div v-if="error" class="error-overlay">
            <div class="error-content">
                <h3>❌ 加载错误</h3>
                <p>{{ error }}</p>
                <div v-if="error.includes('SharedArrayBuffer')" class="cross-origin-help">
                    <h4>🔧 解决方案：</h4>
                    <p>需要启用跨域隔离才能使用高斯泼溅功能</p>
                    <ol>
                        <li>在服务器配置中添加跨域隔离头部</li>
                        <li>或使用支持 SharedArrayBuffer 的现代浏览器</li>
                        <li>建议使用 Chrome 或 Edge 最新版本</li>
                    </ol>
                </div>
                <div class="error-buttons">
                    <button @click="clearError">重试</button>
                    <button @click="goBack" class="back-btn">返回</button>
                </div>
            </div>
        </div>

        <!-- 3D容器 -->
        <div ref="containerRef" class="viewer-container"></div>

        <!-- 控制面板 -->
        <div class="controls">
            <button @click="goBack" class="btn">🏠 返回</button>
            <button @click="loadModel" :disabled="isLoading" class="btn">
                {{ modelLoaded ? "🔄 重载" : "📦 加载" }}
            </button>
            <span v-if="modelLoaded" class="status">✅ 已加载</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import * as GaussianSplats from "@mkkellogg/gaussian-splats-3d";
import { panyidongGsplatUrl } from "../data";

// 状态
const containerRef = ref<HTMLElement>();
const isLoading = ref(false);
const error = ref<string | null>(null);
const loadingMessage = ref("");
const modelLoaded = ref(false);

// 查看器
let viewer: any = null;
let uiMutationObserver: MutationObserver | null = null;
let initialLoadTimer: ReturnType<typeof setTimeout> | null = null;
let uiCleanupTimer: ReturnType<typeof setTimeout> | null = null;
let previousBodyOverflow = "";
let router = useRouter();

const gsplatUISelector =
    ".lil-gui, .progressBarOuterContainer, .spinnerOuterContainer0, .spinnerOuterContainer1, .spinnerOuterContainer2, .infoPanel, [class*='progressBar'], [class*='spinner'], .splatTree, .controlPanel";

// GaussianSplats may append its optional UI outside the viewer container. Limit
// cleanup to those known nodes rather than polling every element in the document.
const hideGsplatUI = (root: ParentNode = document) => {
    root.querySelectorAll(gsplatUISelector).forEach((element) => {
        const uiElement = element as HTMLElement;
        uiElement.style.pointerEvents = "none";
        uiElement.style.display = "none";
    });
};

// 设置MutationObserver来实时监控和清理UI
const setupUIObserver = () => {
    if (uiMutationObserver) return;

    uiMutationObserver = new MutationObserver((mutations) => {
        let needsCleanup = false;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
                    if (
                        element.matches(gsplatUISelector) ||
                        element.querySelector(gsplatUISelector)
                    ) {
                        needsCleanup = true;
                    }
                }
            });
        });

        if (needsCleanup) {
            if (uiCleanupTimer) clearTimeout(uiCleanupTimer);
            uiCleanupTimer = setTimeout(() => {
                hideGsplatUI();
                uiCleanupTimer = null;
            }, 0);
        }
    });

    uiMutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
    });
};

// 检查跨域隔离状态
const checkCrossOriginIsolation = () => {
    console.log("🔍 检查跨域隔离状态:");
    console.log("self.crossOriginIsolated:", self.crossOriginIsolated);
    console.log(
        "SharedArrayBuffer supported:",
        typeof SharedArrayBuffer !== "undefined"
    );

    if (!self.crossOriginIsolated) {
        console.warn("⚠️ 跨域隔离未启用，SharedArrayBuffer 将不可用");
        return false;
    }

    if (typeof SharedArrayBuffer === "undefined") {
        console.warn("⚠️ SharedArrayBuffer 不支持");
        return false;
    }

    return true;
};

// 加载模型
const loadModel = async () => {
    if (!containerRef.value) {
        error.value = "容器未准备好";
        return;
    }

    try {
        isLoading.value = true;
        error.value = null;
        loadingMessage.value = "正在初始化...";

        // 检查跨域隔离
        const hasCrossOriginIsolation = checkCrossOriginIsolation();

        if (!hasCrossOriginIsolation) {
            loadingMessage.value = "正在配置兼容模式...";
        }

        // 清理现有实例
        if (viewer) {
            loadingMessage.value = "清理现有实例...";
            try {
                viewer.dispose();
            } catch (e) {
                console.warn("清理警告:", e);
            }
            viewer = null;
        }

        // 清空容器
        containerRef.value.innerHTML = "";

        // 等待DOM更新
        await nextTick();

        loadingMessage.value = "创建3D查看器...";

        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // 仅监听已知 GaussianSplats UI 的新增节点，不再定时扫描整页 DOM。
        setupUIObserver();

        // 根据跨域隔离状态配置查看器
        const viewerConfig: any = {
            // 基础配置
            cameraUp: [0, 1, 0],
            initialCameraPosition: [0, 10, 15],
            initialCameraLookAt: [0, 0, 0],

            // 容器
            rootElement: containerRef.value,

            // 尝试禁用UI的配置
            showSplatTree: false,
            showControlPanel: false,
            enableSplatTree: false,
            enableControlPanel: false,

            // 性能配置
            halfPrecisionCovariancesOnGPU: true,
            devicePixelRatio: Math.min(window.devicePixelRatio, 1.5),

            // 渲染配置
            enableThreeJSMatrixUpdate: true,
        };

        // 根据跨域隔离状态设置 SharedArrayBuffer 配置
        if (hasCrossOriginIsolation) {
            console.log("✅ 启用 SharedArrayBuffer 支持");
            viewerConfig.useSharedMemory = true;
            viewerConfig.sharedMemoryForWorkers = true;
        } else {
            console.log("⚠️ 禁用 SharedArrayBuffer，使用兼容模式");
            viewerConfig.useSharedMemory = false;
            viewerConfig.sharedMemoryForWorkers = false;
        }

        // 创建查看器
        viewer = new GaussianSplats.Viewer(viewerConfig);

        loadingMessage.value = "加载高斯模型文件...";

        // 根据跨域隔离状态配置场景加载选项
        const sceneConfig: any = {
            progressiveLoad: true,
            showLoadingSpinner: false,
            showLoadingProgressBar: false,
            showLoadingUI: false,
        };

        // 如果没有跨域隔离，尝试禁用可能使用 SharedArrayBuffer 的功能
        if (!hasCrossOriginIsolation) {
            console.log("🔧 应用兼容性配置...");
            // 可以在这里添加其他兼容性配置
        }

        // 加载场景
        await viewer.addSplatScene(
            panyidongGsplatUrl,
            sceneConfig
        );

        loadingMessage.value = "启动渲染...";

        // 启动查看器
        viewer.start();

        // 给库的可选 UI 一次完成创建的机会；之后由 MutationObserver 按事件处理。
        uiCleanupTimer = setTimeout(() => {
            hideGsplatUI();
            uiCleanupTimer = null;
            modelLoaded.value = true;
            console.log("✅ 模型加载完成，UI已清理");
        }, 2000);
    } catch (err) {
        console.error("❌ 加载失败:", err);

        // 检查是否是 SharedArrayBuffer 相关错误
        const errorMessage = err instanceof Error ? err.message : "加载失败";
        if (
            errorMessage.includes("SharedArrayBuffer") ||
            errorMessage.includes("postMessage")
        ) {
            error.value =
                "浏览器不支持 SharedArrayBuffer，请启用跨域隔离或使用支持的浏览器。";
        } else {
            error.value = errorMessage;
        }
    } finally {
        isLoading.value = false;
    }
};

// 清除错误
const clearError = () => {
    error.value = null;
};

// 返回
const goBack = () => {
    console.log("🔙 返回按钮被点击，正在跳转到潘一东矿区场景");
    // 通知主场景关闭子场景
    window.dispatchEvent(new CustomEvent("panyidong-subscene-close"));
    router.push("/panyidong");
};

// 生命周期
onMounted(() => {
    console.log("🚀 Mines Roadway GSplat Viewer mounted");
    console.log("📍 当前路由:", window.location.href);
    console.log("🔗 路由路径:", window.location.pathname);
    initialLoadTimer = setTimeout(loadModel, 500);
});

onUnmounted(() => {
    console.log("🔄 Mines Roadway GSplat Viewer unmounting...");

    // 停止UI监控
    if (uiMutationObserver) {
        uiMutationObserver.disconnect();
        uiMutationObserver = null;
    }

    if (initialLoadTimer) clearTimeout(initialLoadTimer);
    if (uiCleanupTimer) clearTimeout(uiCleanupTimer);

    // 清理查看器
    if (viewer) {
        try {
            viewer.dispose();
        } catch (e) {
            console.warn("Dispose warning:", e);
        }
        viewer = null;
    }

    // 恢复body样式
    document.body.style.overflow = previousBodyOverflow;
});
</script>

<style scoped>
.mine-gsplat-viewer {
    position: relative;
    width: 100%;
    height: 100vh;
    background: #000;
    overflow: hidden;
}

.viewer-container {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
}

.loading-overlay,
.error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-content,
.error-content {
    text-align: center;
    color: white;
    padding: 2rem;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid #333;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #333;
    border-top: 3px solid #0ea5e9;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.controls {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    z-index: 100;
    background: rgba(0, 0, 0, 0.8);
    padding: 10px 15px;
    border-radius: 8px;
    border: 1px solid #333;
}

.btn {
    padding: 8px 16px;
    background: #1e40af;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    min-width: 80px;
}

.btn:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
}

.btn:disabled {
    background: #6b7280;
    cursor: not-allowed;
    transform: none;
}

.status {
    color: #10b981;
    font-size: 14px;
    font-weight: 500;
}

.cross-origin-help {
    margin: 15px 0;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: left;
}

.cross-origin-help h4 {
    margin: 0 0 10px 0;
    color: #fbbf24;
    font-size: 16px;
}

.cross-origin-help p {
    margin: 5px 0;
    color: #e5e7eb;
    font-size: 14px;
}

.cross-origin-help ol {
    margin: 10px 0 0 0;
    padding-left: 20px;
}

.cross-origin-help li {
    margin: 5px 0;
    color: #d1d5db;
    font-size: 13px;
}

.error-buttons {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

.error-buttons button {
    flex: 1;
    background: #dc2626;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.error-buttons button:hover {
    background: #b91c1c;
}

.back-btn {
    background: #6b7280 !important;
}

.back-btn:hover {
    background: #4b5563 !important;
}
</style>

<style>
/* 全局样式 - 强制隐藏和禁用GaussianSplats UI */
.lil-gui,
.progressBarOuterContainer,
.spinnerOuterContainer0,
.spinnerOuterContainer1,
.spinnerOuterContainer2,
.infoPanel,
[class*="progressBar"],
[class*="spinner"],
.splatTree,
.controlPanel {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    position: absolute !important;
    left: -9999px !important;
    top: -9999px !important;
}

/* 防止全屏覆盖阻挡交互 */
body>div[style*="position: absolute"][style*="width: 100%"],
body>div[style*="position: fixed"][style*="width: 100%"] {
    pointer-events: none !important;
}

/* 确保我们的容器可以接收事件 */
.mine-gsplat-viewer,
.mine-gsplat-viewer * {
    pointer-events: auto !important;
}

/* 但是禁用已知的阻挡元素 */
.mine-gsplat-viewer .lil-gui,
.mine-gsplat-viewer [class*="progressBar"],
.mine-gsplat-viewer [class*="spinner"],
.mine-gsplat-viewer .infoPanel {
    pointer-events: none !important;
}
</style>
