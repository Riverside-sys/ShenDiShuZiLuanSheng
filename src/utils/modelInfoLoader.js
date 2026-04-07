// 模型信息加载工具
// 根据模型路径自动推断对应的信息文件路径

/**
 * 根据模型路径获取对应的信息文件路径
 * @param {string} modelPath - 模型文件路径，如 "/models/meshes/Substation.glb"
 * @returns {string} 对应的信息文件路径，如 "/models/meshes/Substation.json"
 */
export const getModelInfoPath = (modelPath) => {
    if (!modelPath) return "";

    // 提取模型名称（去掉扩展名）
    const modelName = modelPath
        .split("/")
        .pop()
        .replace(/\.(glb|gltf)$/, "");

    // 移除后缀
    const baseName = modelName.replace(/_[^_]+$/, "");

    // 构建信息文件路径 - 现在返回 JSON 文件
    const infoPath = modelPath.replace(/\.(glb|gltf)$/, ".json");

    return infoPath;
};

/**
 * 加载模型信息文件
 * @param {string} modelPath - 模型文件路径
 * @returns {Promise<Object>} 信息文件内容（JSON对象）
 */
export const loadModelInfo = async (modelPath) => {
    const infoPath = getModelInfoPath(modelPath);

    if (!infoPath) {
        console.warn("无法推断模型信息文件路径");
        return null;
    }

    try {
        const response = await fetch(infoPath);
        if (response.ok) {
            return await response.json();
        } else {
            console.warn(`无法加载模型信息文件: ${infoPath}`);
            return null;
        }
    } catch (error) {
        console.error(`加载模型信息文件失败: ${infoPath}`, error);
        return null;
    }
};

/**
 * 获取模型的基础元数据
 * @param {string} modelType - 模型类型，如 "substation", "tunnel" 等
 * @returns {Object} 基础元数据对象
 */
export const getBaseMetadata = (modelType) => {
    const metadataMap = {
        substation: {
            dataSource: "变电所模型 (2025年采集)",
            algorithm: "2d转3d模型",
            verticalAccuracy: "±0.15米",
            horizontalAccuracy: "±0.2米",
            resolution: "0.01米（主要区域）至0.02米（边缘区域）",
        },
        tunnel: {
            dataSource: "巷道模型 (2025年采集)",
            algorithm: "2d转3d模型",
            verticalAccuracy: "±0.15米",
            horizontalAccuracy: "±0.2米",
            resolution: "0.01米（主要区域）至0.02米（边缘区域）",
        },
        face: {
            dataSource: "工作面模型 (2025年采集)",
            algorithm: "2d转3d模型",
            verticalAccuracy: "±0.15米",
            horizontalAccuracy: "±0.2米",
            resolution: "0.01米（主要区域）至0.02米（边缘区域）",
        },
        fireEquipmentStorage: {
            dataSource: "消防器材库模型 (2025年采集)",
            algorithm: "2d转3d模型",
            verticalAccuracy: "±0.15米",
            horizontalAccuracy: "±0.2米",
            resolution: "0.01米（主要区域）至0.02米（边缘区域）",
        },
        fullyMechanizedFace: {
            dataSource: "综放工作面模型 (2025年采集)",
            algorithm: "2d转3d模型",
            verticalAccuracy: "±0.15米",
            horizontalAccuracy: "±0.2米",
            resolution: "0.01米（主要区域）至0.02米（边缘区域）",
        },
        default: {
            dataSource: "3D模型 (2025年采集)",
            algorithm: "2d转3d模型",
            verticalAccuracy: "±0.15米",
            horizontalAccuracy: "±0.2米",
            resolution: "0.01米（主要区域）至0.02米（边缘区域）",
        },
    };

    return metadataMap[modelType] || metadataMap.default;
};

/**
 * 获取模型的面板标题
 * @param {string} modelType - 模型类型
 * @returns {string} 面板标题
 */
export const getPanelTitle = (modelType) => {
    const titleMap = {
        substation: "变电所模型信息",
        tunnel: "巷道模型信息",
        face: "工作面模型信息",
        fireEquipmentStorage: "消防器材库模型信息",
        fullyMechanizedFace: "综放工作面模型信息",
        default: "模型信息",
    };

    return titleMap[modelType] || titleMap.default;
};
