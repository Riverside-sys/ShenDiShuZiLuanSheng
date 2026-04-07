// 获取元素 z-index 值，在新版本的 Element Plus 中，我们需要自己实现这个功能，因为内部 API 已更改

let zIndex = 2000;

const nextZIndex = function () {
    return ++zIndex;
};

// 创建一个简单的 PopupManager 替代
const PopupManager = {
    zIndex,
    nextZIndex,
};

export { nextZIndex, PopupManager };
