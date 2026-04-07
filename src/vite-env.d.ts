/// <reference types="vite/client" />

// 声明 .vue 文件类型
declare module "*.vue" {
    import { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

// 声明 .json 文件类型，如果你需要在 TypeScript 中导入 JSON 文件
declare module "*.json" {
    const value: any;
    export default value;
}
