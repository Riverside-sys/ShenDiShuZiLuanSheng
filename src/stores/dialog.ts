import { defineStore } from "pinia";

// Dialog内容项类型
interface DialogContentItem {
    [key: string]: any;
}

// Dialog状态类型
interface DialogState {
    dialogVisible: boolean;
    XY: [number, number];
    DialogInfo: Record<string, any>;
    title: string;
    content: DialogContentItem[];
    lastEvent: Record<string, any>;
    tag: string;
}

export const useDialogStore = defineStore({
    id: "Dialog",
    state: (): DialogState => ({
        dialogVisible: false,
        XY: [0, 0],
        DialogInfo: {},
        title: "详细信息",
        // 内容
        content: [],
        lastEvent: {} as PointerEvent,
        tag: ''
    }),
    actions: {
        setDialogVisible(dialogVisible: boolean) {
            this.$patch({
                dialogVisible,
            });
            //隐藏就销毁原有数据
            !dialogVisible && this.$patch({
                content: []
            })
        },
        setXY(XY: [number, number]) {
            this.$patch({
                XY,
            });
        },
        setLastEvent(lastEvent: Record<string, any>) {
            this.$patch({
                lastEvent
            })
        },
        setDialogInfo(DialogInfo: Record<string, any>) {
            this.$patch({
                DialogInfo,
            });
        },
        setTitle(title: string) {
            this.$patch({
                title,
            });
        },
        setContent(content: DialogContentItem[]) {
            this.$patch({
                content,
            });
        },
        setTag(tag: string) {
            this.$patch({
                tag
            })
        }
    },
});
