import { defineStore } from "pinia";

// 动画项类型
interface AnimationItem {
    [key: string]: any;
}

// 动画状态类型
interface AnimateState {
    Animate: boolean;
    AnimationList: AnimationItem[];
    AnimationImgList: string[];
}

export const useAnimateStore = defineStore({
    id: "Animate",
    state: (): AnimateState => ({
        Animate: false,
        AnimationList: [],
        AnimationImgList: [],
    }),

    actions: {
        async SetAnimate(payload: boolean) {
            this.$patch({
                Animate: payload,
            });
        },
        async SetAnimationList(payload: AnimationItem[]) {
            this.$patch({
                AnimationList: payload,
            });
        },
        async SetAnimationImgList(payload: string[]) {
            this.$patch({
                AnimationImgList: payload,
            });
        },
    },
});
