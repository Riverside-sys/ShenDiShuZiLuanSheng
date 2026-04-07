import type { App } from "vue";
import ElementPlus from "element-plus";
import Antd from "ant-design-vue";
import { setupDragDirective } from "./directives";

// 全局组件导入
import Icon from "../components/Icon/index.vue";
import FirstTitle from "../components/First_title/index.vue";
import SecondTitle from "../components/Second_title/index.vue";
import BtnFeatures from "../components/features/index.vue";
import V3Echarts from "../components/V3Echarts/index.vue";

// 导入样式
import "element-plus/dist/index.css";
import "ant-design-vue/dist/reset.css";
import "animate.css";
import "../styles/global.css";
import "../styles/normalize.css";
import "echarts-liquidfill";

/**
 * 注册全局组件
 */
function setupGlobalComponents(app: App) {
    app.component("Icon", Icon);
    app.component("FirstTitle", FirstTitle);
    app.component("SecondTitle", SecondTitle);
    app.component("BtnFeatures", BtnFeatures);
    app.component("V3Echarts", V3Echarts);
}

/**
 * 注册所有插件、组件和指令
 */
export function setupPlugins(app: App) {
    // 注册UI库
    app.use(ElementPlus);
    app.use(Antd);
    
    // 注册全局组件
    setupGlobalComponents(app);
    
    // 注册自定义指令
    setupDragDirective(app);
}
