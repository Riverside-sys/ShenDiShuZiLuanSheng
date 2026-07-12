export interface Su95StratigraphyLayer {
    readonly sourceRow: number;
    readonly wellId: "苏95";
    readonly topDepth: number;
    readonly bottomDepth: number;
    readonly thickness: number;
    readonly description: string;
    readonly color: string;
    readonly lithology: string;
    /**
     * 原工作簿“_段”列中的原始代码，仅表示源数据值，
     * 不将苏95单井分层外推为区域统一地层。
     */
    readonly sourceSectionCode: string;
}

export interface Su95StratigraphySummary {
    readonly totalLayers: number;
    readonly depthRange: {
        readonly minimum: number;
        readonly maximum: number;
    };
    readonly totalThickness: number;
    readonly depthGapCount: number;
    readonly totalGapThickness: number;
    readonly lithologyCounts: Readonly<Record<string, number>>;
}
