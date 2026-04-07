import type { RouteRecordRaw } from "vue-router";

export const HanshuicengItem: Array<RouteRecordRaw> = [
  {
    path: '/hanshuiceng',
    name: 'hanshuiceng',
    component: () => import('@/Views/hanshuiceng/index.vue'),
    meta: {
      title: '含水层',
      hideInMenu: false,
    },
    children: []
  }
]