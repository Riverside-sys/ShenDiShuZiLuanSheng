import type { RouteRecordRaw } from "vue-router";

export const SurfaceItem: Array<RouteRecordRaw> = [
    {
        path: "/surface",
        name: "surface",
        component: () => import("@/Views/surface/index.vue"),
        meta: {
            title: "地面场景",
            hideInMenu: false,
        },
    },
];
