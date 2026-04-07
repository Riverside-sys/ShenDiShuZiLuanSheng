import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import cesium from "vite-plugin-cesium";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('ion-')
                }
            }
        }),
        cesium()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
        extensions: [
            ".mjs",
            ".mts",
            ".js",
            ".ts",
            ".jsx",
            ".tsx",
            ".json",
            ".vue",
        ],
    },
    server: {
        host: true,
        port: 8889,
        cors: true,
    },
});
