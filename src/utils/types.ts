// 合并的类型定义文件

// ===== 通用类型 =====
export type Coordinate = [number, number, number?];

export interface SceneConfig {
    id: string;
    name: string;
    lon: number;
    lat: number;
    height: number;
    heading: number;
    pitch: number;
    roll: number;
}

export interface ButtonData {
    id: number;
    name: string;
    normalIcon: string;
    activeIcon: string;
}

// ===== GeoJSON类型 =====
export interface GeoJSONFeature {
    type: "Feature";
    geometry: {
        type: string;
        coordinates: number[][][] | number[][];
    };
    properties: Record<string, any>;
}

export interface GeoJSONFeatureCollection {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
}

// ===== 业务类型 =====
export interface LayerData {
    iD: string;
    name: string;
    [key: string]: any;
}

export interface BuildingData {
    coordinate: Coordinate;
    text: string;
    [key: string]: any;
}

export interface MarkerObject {
    id: string;
    coordinate: Coordinate;
    text?: string;
    [key: string]: any;
}

export interface EchartsOptions {
    [key: string]: any;
}

// ===== Store相关类型 =====
export interface DialogContentItem {
    [key: string]: any;
}

export interface AnimationItem {
    [key: string]: any;
}

// ===== 指令相关类型 =====
export interface DragDirectiveBinding {
    container?: string;
    selector?: string;
}

// ===== Gaussian Splats 3D类型 =====
export interface GaussianViewerOptions {
    cameraUp?: number[];
    initialCameraPosition?: number[];
    initialCameraLookAt?: number[];
    rootElement?: HTMLElement;
    showSplatTree?: boolean;
    showControlPanel?: boolean;
    enableSplatTree?: boolean;
    enableControlPanel?: boolean;
    halfPrecisionCovariancesOnGPU?: boolean;
    devicePixelRatio?: number;
    enableThreeJSMatrixUpdate?: boolean;
    useSharedMemory?: boolean;
    sharedMemoryForWorkers?: boolean;
}

export interface GaussianSplatSceneOptions {
    progressiveLoad?: boolean;
    showLoadingSpinner?: boolean;
    showLoadingProgressBar?: boolean;
    showLoadingUI?: boolean;
}
