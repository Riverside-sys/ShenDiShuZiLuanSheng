import panyidongModelAssetUrl from "./潘一东巷道模型.glb?url";
import panyidongGsplatAssetUrl from "./VID_20250307_160117_point_cloud.ply?url";
import panyidongMonitoringVideoAssetUrl from "./573240324-1-16.mp4?url";

import woniushanMergedMeshUrl from "./卧牛山巷道模型/Mesh_colored.ply?url";

export const panyidongModelUrl = panyidongModelAssetUrl;
export const panyidongGsplatUrl = panyidongGsplatAssetUrl;
export const panyidongMonitoringVideoUrl = panyidongMonitoringVideoAssetUrl;

export const woniushanMergedUrl = woniushanMergedMeshUrl;

export interface WoniushanSegment {
  id: number;
  name: string;
  pointCount: number;
  hasColor: boolean;
}

// 分段模型当前只用于质量面板统计。将 PLY 头信息固化为元数据，
// 避免用户定位时再下载并在主线程解析百万面模型。
export const woniushanSegments: WoniushanSegment[] = [
  { id: 1, name: "01 段巷道", pointCount: 522_968, hasColor: false },
  { id: 2, name: "02 段巷道", pointCount: 620_174, hasColor: false },
  { id: 3, name: "03 段巷道", pointCount: 585_784, hasColor: false },
  { id: 4, name: "04 段巷道", pointCount: 580_858, hasColor: false },
  { id: 5, name: "05 段巷道", pointCount: 470_536, hasColor: false },
  { id: 6, name: "06 段巷道", pointCount: 562_390, hasColor: false },
  { id: 7, name: "07 段巷道", pointCount: 528_664, hasColor: false },
  { id: 8, name: "08 段巷道", pointCount: 586_182, hasColor: false },
  { id: 9, name: "09 段巷道", pointCount: 641_522, hasColor: false },
  { id: 10, name: "10 段巷道", pointCount: 628_136, hasColor: false },
  { id: 11, name: "11 段巷道", pointCount: 745_708, hasColor: false },
];
