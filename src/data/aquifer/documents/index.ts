export interface AquiferWellDocument {
    readonly wellId: string;
    readonly title: string;
    readonly url: string;
    readonly sourceNote: string;
}

/**
 * 可在前端直接预览的扫描件/剖面图。
 * 原始超长图已缩放为网页预览版，放在 public/aquifer/documents/。
 */
export const AQUIFER_WELL_DOCUMENTS: readonly AquiferWellDocument[] = Object.freeze([
    {
        wellId: "洋3",
        title: "洋3井原始手剖面扫描",
        url: "/aquifer/documents/yang3-section.jpg",
        sourceNote: "来源：吉大资料「华洋3井.jpg」网页预览版（宽度已压缩，可滚动查看）",
    },
]);

const DOCUMENTS_BY_WELL_ID = new Map(
    AQUIFER_WELL_DOCUMENTS.map((document) => [document.wellId, document]),
);

export const getAquiferWellDocument = (
    wellId: string,
): AquiferWellDocument | undefined => DOCUMENTS_BY_WELL_ID.get(wellId);
