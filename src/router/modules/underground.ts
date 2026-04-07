import type { RouteRecordRaw } from "vue-router";

export const UndergroundItem: Array<RouteRecordRaw> = [
    {
        path: "/underground",
        name: "underground",
        redirect: "/underground/mines",
        component: () => import("@/Views/underground/index.vue"),
        meta: {
            title: "地下场景",
            hideInMenu: false,
        },
        children: [
            // 矿井场景及其子路由
            {
                path: "mines",
                name: "mines",
                component: () => import("@/Views/underground/index.vue"),
                meta: {
                    title: "矿山场景",
                    hideInMenu: false,
                },
                children: [
                    // 子场景路由
                    {
                        path: "subscenes/backfillminingface",
                        name: "mines-backfillminingface",
                        component: () =>
                            import(
                                "@/Views/underground/mines/subscenes/BackfillMiningFace.vue"
                            ),
                        meta: {
                            title: "填充回采工作面",
                            hideInMenu: false,
                        },
                    },
                    {
                        path: "subscenes/emergencyrefugechamber",
                        name: "mines-emergencyrefugechamber",
                        component: () =>
                            import(
                                "@/Views/underground/mines/subscenes/EmergencyRefugeChamber.vue"
                            ),
                        meta: {
                            title: "避难硐室",
                            hideInMenu: false,
                        },
                    },
                    {
                        path: "subscenes/fireequipmentstorage",
                        name: "mines-fireequipmentstorage",
                        component: () =>
                            import(
                                "@/Views/underground/mines/subscenes/FireEquipmentStorage.vue"
                            ),
                        meta: {
                            title: "消防器材库",
                            hideInMenu: false,
                        },
                    },
                    {
                        path: "subscenes/fullymechanizedface",
                        name: "mines-fullymechanizedface",
                        component: () =>
                            import(
                                "@/Views/underground/mines/subscenes/FullyMechanizedFace.vue"
                            ),
                        meta: {
                            title: "综放工作面",
                            hideInMenu: false,
                        },
                    },
                    {
                        path: "subscenes/geologicalstratification",
                        name: "mines-geologicalstratification",
                        component: () =>
                            import(
                                "@/Views/underground/mines/subscenes/GeologicalStratification.vue"
                            ),
                        meta: {
                            title: "地质分层",
                            hideInMenu: false,
                        },
                    },
                    {
                        path: "subscenes/substationviewer",
                        name: "mines-substationviewer",
                        component: () =>
                            import(
                                "@/Views/underground/mines/subscenes/SubstationViewer.vue"
                            ),
                        meta: {
                            title: "变电站",
                            hideInMenu: false,
                        },
                    },
                    {
                        path: "subscenes/tunnelviewer",
                        name: "mines-tunnelviewer",
                        component: () =>
                            import(
                                "@/Views/underground/mines/subscenes/TunnelViewer.vue"
                            ),
                        meta: {
                            title: "巷道",
                            hideInMenu: false,
                        },
                    },
                    {
                        path: "subscenes/mines_roadway_gsplat",
                        name: "mines_roadway_gsplat",
                        component: () =>
                            import(
                                "@/Views/underground/mines/subscenes/MinesRoadwayGsplat.vue"
                            ),
                        meta: {
                            title: "高斯泼溅巷道",
                            hideInMenu: false,
                        },
                    },
                ],
            },
            // 含水层场景及其子路由
            {
                path: "aquifer",
                name: "aquifer",
                component: () => import("@/Views/underground/index.vue"),
                meta: {
                    title: "含水层",
                    hideInMenu: false,
                },
                children: [
                    // 子场景路由
                    {
                        path: "subscenes/vp20",
                        name: "aquifer-vp20",
                        component: () =>
                            import(
                                "@/Views/underground/aquifer/subscenes/vp20.vue"
                            ),
                        meta: {
                            title: "VP20",
                            hideInMenu: false,
                        },
                    },
                    {
                        path: "subscenes/vp40",
                        name: "aquifer-vp40",
                        component: () =>
                            import(
                                "@/Views/underground/aquifer/subscenes/vp40.vue"
                            ),
                        meta: {
                            title: "VP40",
                            hideInMenu: false,
                        },
                    },
                    {
                        path: "subscenes/vp100",
                        name: "aquifer-vp100",
                        component: () =>
                            import(
                                "@/Views/underground/aquifer/subscenes/vp100.vue"
                            ),
                        meta: {
                            title: "VP100",
                            hideInMenu: false,
                        },
                    },
                    {
                        path: "subscenes/vp250",
                        name: "aquifer-vp250",
                        component: () =>
                            import(
                                "@/Views/underground/aquifer/subscenes/vp250.vue"
                            ),
                        meta: {
                            title: "VP250",
                            hideInMenu: false,
                        },
                    },
                ],
            },
            // 盐洞场景及其子路由
            {
                path: "saltcave",
                name: "saltcave",
                component: () => import("@/Views/underground/index.vue"),
                meta: {
                    title: "盐洞场景",
                    hideInMenu: false,
                },
                children: [],
            },
        ],
    },
];
