import {
    createRouter,
    createWebHashHistory,
    // createWebHistory,
} from "vue-router";
import { useAnimateStore } from "../stores/animate";
import type { RouteRecordRaw } from "vue-router";
// 引入路由模块
import { SurfaceItem } from "./modules/surface";
import { PanyidongItem } from "./modules/panyidong";
import { HanshuicengItem } from "./modules/hanshuiceng";
import { SaltCaveItem } from "./modules/saltCave";

const routes: Array<RouteRecordRaw> = [
    // 根路由重定向到 /home
    {
        path: "/",
        redirect: "/home",
    },

    // Home 路由 - 重定向到 Surface
    {
        path: "/home",
        name: "home",
        redirect: "/surface",
    },

    // Surface 路由模块
    ...SurfaceItem,

    // 潘一东矿区 路由模块
    ...PanyidongItem,

    // 含水层 路由模块
    ...HanshuicengItem,

    // 盐穴 路由模块
    ...SaltCaveItem,

    {
        path: "/:pathMatch(.*)",
        component: () => import("@/Views/404/index.vue"),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
// 使用路由拦截进行动画切换
let timer: any = null;
let timermon: any = null;
router.beforeEach((_to, _from, next) => {
    // if (
    //   ![
    //     // "Expressinterworking",
    //     // "Expressway",
    //     // "Expresstunnel",
    //     // "TollGate",
    //     // "ServiceArea",
    //   ].includes(to.name)
    // ) {

    // } else {
    //   next();
    // }
    // console.log(to);

    const animatestore = useAnimateStore && useAnimateStore();
    animatestore && animatestore.SetAnimate(false);
    timer && clearTimeout(timer);
    timermon && clearTimeout(timermon);

    timer = setTimeout(() => {
        next();
        timermon = setTimeout(() => {
            animatestore && animatestore.SetAnimate(true);
        }, 100);
    }, 50);
});

export default router;
