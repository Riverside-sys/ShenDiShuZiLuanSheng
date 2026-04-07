import { defineStore } from "pinia";
import type { LayerData } from "../utils/types";

// 工具Store状态类型
interface ToolsState {
    LayerTreeShow: boolean;
    infotree: LayerData[] | null;
    AnimationShow: boolean;
    SkyBoxShow: boolean;
    WeatherShow: boolean;
    BuildShow: boolean;
    Buildinfo: Record<string, any> | null;
    UIShow: boolean;
}

export const useToolsStore = defineStore({
    id: "Tools",
    state: (): ToolsState => ({
        //   图层树展示
        LayerTreeShow: false,
        infotree: null,
        // 导览列表展示
        AnimationShow: false,
        // 天空盒展示
        SkyBoxShow: false,
        // 气象展示
        WeatherShow: false,
        // 建筑拆解展示
        BuildShow: false,
        // 拆楼信息保存
        Buildinfo: null,
        //  UI显隐
        UIShow: false,
    }),

    actions: {
        async SetLayerTreeShow(payload: boolean) {
            this.$patch({
                LayerTreeShow: payload,
            });
        },
        async Setinfotree(payload: LayerData[] | null) {
            this.$patch({
                infotree: payload,
            });
        },
        async SetAnimationShow(payload: boolean) {
            this.$patch({
                AnimationShow: payload,
            });
        },
        async SetSkyBoxShow(payload: boolean) {
            this.$patch({
                SkyBoxShow: payload,
            });
        },
        async SetWeatherShow(payload: boolean) {
            this.$patch({
                WeatherShow: payload,
            });
        },
        async SetBuildShow(payload: boolean) {
            this.$patch({
                BuildShow: payload,
            });
        },
        async SetBuildinfo(payload: Record<string, any> | null) {
            this.$patch({
                Buildinfo: payload,
            });
        },
        async SetUIShow(payload: boolean) {
            this.$patch({
                UIShow: payload,
            });
        },
    },
});
