import type { RouteRecordRaw } from "vue-router";

export const HomeItem: Array<RouteRecordRaw> = [
    // overview 功能已合并到 home/index.vue 中
    // 如果需要保留 overview 路由，可以重定向到 home
    {
        path: "overview",
        redirect: "/home",
    },
    {
        path: "craft",
        name: "craft",
        meta: {
            title: "工艺流程",
            hideInMenu: false,
        },
        component: () => import("@/Views/home/craft/index.vue"),
    },
    {
        path: "energy",
        name: "energy",
        meta: {
            title: "储能管理",
            hideInMenu: false,
        },
        component: () => import("@/Views/home/energy/index.vue"),
    },
    {
        path: "monitor",
        name: "monitor",
        meta: {
            title: "视频监测",
            hideInMenu: false,
        },
        component: () => import("@/Views/home/monitor/index.vue"),
    },
    {
        path: "environment",
        name: "environment",
        meta: {
            title: "环境信息",
            hideInMenu: false,
        },
        component: () => import("@/Views/home/environment/index.vue"),
    },
    {
        path: "emergency",
        name: "emergency",
        meta: {
            title: "应急管理",
            hideInMenu: false,
        },
        component: () => import("@/Views/home/emergency/index.vue"),
    },
];
