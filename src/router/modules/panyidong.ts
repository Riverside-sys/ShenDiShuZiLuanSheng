import type { RouteRecordRaw } from "vue-router";

export const PanyidongItem: Array<RouteRecordRaw> = [
  {
    path: '/panyidong',
    name: 'panyidong',
    component: () => import('@/Views/panyidong/index.vue'),
    meta: {
      title: '潘一东矿区',
      hideInMenu: false,
    },
    children: [
      {
        path: 'subscenes/mines_roadway_gsplat',
        name: 'mines_roadway_gsplat',
        component: () => import('@/Views/panyidong/subscenes/MinesRoadwayGsplat.vue'),
        meta: {
          title: '高斯泼溅巷道',
          hideInMenu: false,
        },
      },
      {
        path: 'subscenes/woniushan_roadway',
        name: 'woniushan_roadway',
        component: () => import('@/Views/panyidong/subscenes/WoniushanRoadway.vue'),
        meta: {
          title: '卧牛山巷道',
          hideInMenu: false,
        },
      }
    ]
  }
]