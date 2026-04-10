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
    children: [
      {
        path: 'subscenes/salt_cave_single',
        name: 'salt_cave_single',
        component: () => import('@/Views/saltCave/subscenes/SaltCaveSingle.vue'),
        meta: {
          title: '盐穴单体场景',
          hideInMenu: false,
        },
      }
    ]
  }
]
