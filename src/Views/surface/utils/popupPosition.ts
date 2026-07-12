interface Point {
    readonly x: number;
    readonly y: number;
}

interface Size {
    readonly width: number;
    readonly height: number;
}

export interface PopupPosition {
    readonly left: number;
    readonly top: number;
}

export const calculatePopupPosition = (
    anchor: Point,
    viewport: Size,
    card: Size,
    margin = 12,
    offset = 15,
): PopupPosition => {
    const maxLeft = Math.max(margin, viewport.width - card.width - margin);
    const maxTop = Math.max(margin, viewport.height - card.height - margin);

    return {
        left: Math.max(margin, Math.min(anchor.x + offset, maxLeft)),
        top: Math.max(margin, Math.min(anchor.y + offset, maxTop)),
    };
};

export const clampPopupPosition = (
    position: Point,
    viewport: Size,
    card: Size,
    margin = 12,
): PopupPosition => {
    const maxLeft = Math.max(margin, viewport.width - card.width - margin);
    const maxTop = Math.max(margin, viewport.height - card.height - margin);

    return {
        left: Math.max(margin, Math.min(position.x, maxLeft)),
        top: Math.max(margin, Math.min(position.y, maxTop)),
    };
};
