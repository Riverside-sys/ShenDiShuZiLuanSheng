export interface AquiferWellDocument {
    readonly wellId: string;
    readonly title: string;
    readonly url: string;
    readonly actionLabel: string;
    readonly sourceNote: string;
}

/**
 * 可在前端直接预览的扫描件 / 剖面图 / 柱状图。
 * 预览版放在 public/aquifer/documents/。
 */
export const AQUIFER_WELL_DOCUMENTS: readonly AquiferWellDocument[] =
    Object.freeze([
        {
            wellId: "洋3",
            title: "洋3井原始手剖面扫描",
            url: "/aquifer/documents/yang3-section.jpg",
            actionLabel: "查看原始剖面图",
            sourceNote:
                "来源：吉大资料「华洋3井.jpg」网页预览版（宽度已压缩，可滚动查看）",
        },
        {
            wellId: "石4井",
            title: "石4井地层综合柱状图",
            url: "/aquifer/documents/shi4-column.jpg",
            actionLabel: "查看综合柱状图",
            sourceNote:
                "来源：吉大资料 DWG 柱状图网页预览版（由 ODA→DXF→栅格导出，可滚动查看）",
        },
        {
            wellId: "ZK5",
            title: "ZK5井地层综合柱状图",
            url: "/aquifer/documents/zk5-column.jpg",
            actionLabel: "查看综合柱状图",
            sourceNote:
                "来源：吉大资料 DWG 柱状图网页预览版（由 ODA→DXF→栅格导出，可滚动查看）",
        },
        {
            wellId: "ZK6",
            title: "ZK6井地层综合柱状图",
            url: "/aquifer/documents/zk6-column.jpg",
            actionLabel: "查看综合柱状图",
            sourceNote:
                "来源：吉大资料 DWG 柱状图网页预览版（由 ODA→DXF→栅格导出，可滚动查看）",
        },
    ]);

const DOCUMENTS_BY_WELL_ID = new Map(
    AQUIFER_WELL_DOCUMENTS.map((document) => [document.wellId, document]),
);

export const getAquiferWellDocument = (
    wellId: string,
): AquiferWellDocument | undefined => DOCUMENTS_BY_WELL_ID.get(wellId);
