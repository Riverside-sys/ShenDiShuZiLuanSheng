import type { RouteRecordRaw } from "vue-router";

export const SaltCaveItem: Array<RouteRecordRaw> = [
  {
    path: '/saltCave',
    name: 'saltCave',
    component: () => import('@/Views/saltCave/index.vue'),
    meta: {
      title: '盐穴',
      hideInMenu: false,
    },
    children: []
  }
]
