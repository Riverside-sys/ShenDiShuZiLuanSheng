import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import { createPinia } from "pinia";
import { setupPlugins } from "./utils/plugins";

// 创建Vue应用实例
const app = createApp(App);

// 注册插件、组件和指令
setupPlugins(app);

// 注册状态管理和路由
app.use(createPinia());
app.use(router);

// 挂载应用
app.mount("#app");
