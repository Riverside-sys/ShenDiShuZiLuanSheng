import type { App } from "vue";
import { setupDragDirective } from "./directives";

// 导入样式
import "animate.css";
import "../styles/global.css";
import "../styles/normalize.css";
import "echarts-liquidfill";

/**
 * 注册所有插件、组件和指令
 */
export function setupPlugins(app: App) {
    // 注册自定义指令
    setupDragDirective(app);
}
