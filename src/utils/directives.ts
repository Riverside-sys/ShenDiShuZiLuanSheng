import type { App, Directive } from "vue";
import { nextZIndex, PopupManager } from "./common";
import { useDialogStore } from "../stores/dialog";
import type { DragDirectiveBinding } from "./types";

// 拖拽指令实现
const dragDirective: Directive<HTMLElement, DragDirectiveBinding> = {
    mounted(el: HTMLElement, binding) {
        const value = binding.value;
        const moveContainer =
            (value?.container && document.querySelector(value.container)) ||
            document.querySelector("#map3dContainer") ||
            document.body;
        
        const selector =
            (value?.selector && el.querySelector(value.selector)) ||
            el.querySelector(".drag-el") ||
            el;

        if (selector !== el) {
            selector.classList.add("ls-draggable");
        }

        (selector as HTMLElement).onmousedown = function (e: MouseEvent) {
            el.style.transition = "none";
            const disx = e.clientX - el.offsetLeft;
            const disy = e.clientY - el.offsetTop;
            const mw = (moveContainer as HTMLElement).offsetWidth;
            const mh = (moveContainer as HTMLElement).offsetHeight;
            const ew = el.offsetWidth;
            const eh = el.offsetHeight;

            // 点击后将当前组件置顶
            if (el.style.zIndex !== "" + (PopupManager.zIndex - 1)) {
                el.style.zIndex = nextZIndex().toString();
            }

            (moveContainer as HTMLElement).onmousemove = function (e: MouseEvent) {
                let left = e.clientX - disx;
                let top = e.clientY - disy;
                
                if (left < 0) left = 0;
                if (top < 0) top = 0;
                if (left > mw - ew) left = mw - ew;
                if (top > mh - eh) top = mh - eh;
                
                el.style.left = left + "px";
                el.style.top = top + "px";
            };

            (moveContainer as HTMLElement).onmouseup = function (e: MouseEvent) {
                const left = e.clientX - disx;
                const top = e.clientY - disy;
                (moveContainer as HTMLElement).onmousemove = null;
                (moveContainer as HTMLElement).onmouseup = null;
                useDialogStore().setXY([left, top]);
                el.style.transition = "all 0.3s";
            };
        };
    },
};

/**
 * 注册拖拽指令
 */
export function setupDragDirective(app: App) {
    app.directive("drag", dragDirective);
}

export { dragDirective };
