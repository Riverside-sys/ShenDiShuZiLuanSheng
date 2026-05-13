import panyidongModelAssetUrl from "./潘一东巷道模型.glb?url";
import panyidongGsplatAssetUrl from "./VID_20250307_160117_point_cloud.ply?url";
import panyidongMonitoringVideoAssetUrl from "./573240324-1-16.mp4?url";

import woniushanMergedMeshUrl from "./卧牛山巷道模型/Merged mesh.ply?url";
import woniushanSegment01Url from "./卧牛山巷道模型/01_perfect.ply?url";
import woniushanSegment02Url from "./卧牛山巷道模型/02_perfect.ply?url";
import woniushanSegment03Url from "./卧牛山巷道模型/03_perfect.ply?url";
import woniushanSegment04Url from "./卧牛山巷道模型/04_perfect.ply?url";
import woniushanSegment05Url from "./卧牛山巷道模型/05_perfect.ply?url";
import woniushanSegment06Url from "./卧牛山巷道模型/06_perfect.ply?url";
import woniushanSegment07Url from "./卧牛山巷道模型/07_perfect.ply?url";
import woniushanSegment08Url from "./卧牛山巷道模型/08_perfect.ply?url";
import woniushanSegment09Url from "./卧牛山巷道模型/09_perfect.ply?url";
import woniushanSegment10Url from "./卧牛山巷道模型/10_perfect.ply?url";
import woniushanSegment11Url from "./卧牛山巷道模型/11_perfect.ply?url";

export const panyidongModelUrl = panyidongModelAssetUrl;
export const panyidongGsplatUrl = panyidongGsplatAssetUrl;
export const panyidongMonitoringVideoUrl = panyidongMonitoringVideoAssetUrl;

export const woniushanMergedUrl = woniushanMergedMeshUrl;

export interface WoniushanSegment {
  id: number;
  name: string;
  url: string;
}

export const woniushanSegments: WoniushanSegment[] = [
  { id: 1, name: "01 段巷道", url: woniushanSegment01Url },
  { id: 2, name: "02 段巷道", url: woniushanSegment02Url },
  { id: 3, name: "03 段巷道", url: woniushanSegment03Url },
  { id: 4, name: "04 段巷道", url: woniushanSegment04Url },
  { id: 5, name: "05 段巷道", url: woniushanSegment05Url },
  { id: 6, name: "06 段巷道", url: woniushanSegment06Url },
  { id: 7, name: "07 段巷道", url: woniushanSegment07Url },
  { id: 8, name: "08 段巷道", url: woniushanSegment08Url },
  { id: 9, name: "09 段巷道", url: woniushanSegment09Url },
  { id: 10, name: "10 段巷道", url: woniushanSegment10Url },
  { id: 11, name: "11 段巷道", url: woniushanSegment11Url },
];
