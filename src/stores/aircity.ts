// @ts-check
import { defineStore } from "pinia";

export const useAirCityStore = defineStore({
    id: "aircity",
    state: () => ({
        AirCityPlayer: null,
        AirCityApi: null,
        TreeInfo: null,
        IsOnReady: false,
        // 现在所在页面或模块
        nowLocal: "",
    }),

    actions: {
        async SetAirCityPlayer(pyload: any) {
            this.$patch({
                AirCityPlayer: pyload,
            });
        },
        async SetAirCityApi(pyload: any) {
            this.$patch({
                AirCityApi: pyload,
            });
        },
        async SetTreeInfo(pyload: any) {
            this.$patch({
                TreeInfo: pyload,
            });
        },
        async SetIsOnReady(pyload: any) {
            this.$patch({
                IsOnReady: pyload,
            });
        },
        async SetnowLocal(pyload: any) {
            this.$patch({
                nowLocal: pyload,
            });
        },
    },
});

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useAirCityStore, import.meta.hot));
// }
