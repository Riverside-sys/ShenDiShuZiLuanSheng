import {
    Cartesian2,
    Cartesian3,
    Color,
    ColorMaterialProperty,
    ConstantProperty,
    HorizontalOrigin,
    LabelStyle,
    NearFarScalar,
    VerticalOrigin,
    type Entity,
    type Viewer,
} from "cesium";

import {
    AQUIFER_WELL_SCENE_GEOMETRY,
    type AquiferWellSceneGeometry,
} from "@/data/aquifer/scene3d";

export { getAquiferWellIdFromPicked, isAquiferDepthEnvelopePicked, resolveAquiferWellSceneHover } from "./aquiferWellPick";

/** 场景以椭球高 0 为近似地面；测深向下为正，故高度 = -depth。 */
export const aquiferHeightFromDepth = (depthMeters: number): number =>
    -depthMeters;

const COLOR_LOGGED = Color.fromCssColorString("#65f6c5");
const COLOR_COORDINATE = Color.fromCssColorString("#00d8ff");
const COLOR_HOVER = Color.fromCssColorString("#ffe566");
const COLOR_SELECTED = Color.fromCssColorString("#ffb347");
const COLOR_ENVELOPE = Color.fromCssColorString("#26d9ff").withAlpha(0.22);

export interface AquiferWellSceneEntities {
    readonly markers: Entity[];
    readonly sticks: Entity[];
    readonly envelope: Entity | null;
}

export interface AquiferWellHighlightState {
    readonly hoveredWellId: string | null;
    readonly selectedWellId: string | null;
}

const readWellId = (entity: Entity): string | null => {
    const property = entity.properties?.aquiferWellId;
    if (property && typeof property.getValue === "function") {
        const value = property.getValue();
        return typeof value === "string" ? value : null;
    }
    if (typeof entity.id === "string") {
        const match = entity.id.match(/^aquifer-well-(?:marker|stick)-(.+)$/);
        return match?.[1] ?? null;
    }
    return null;
};

export const clearAquiferWellSceneEntities = (
    viewer: Viewer,
    entities: AquiferWellSceneEntities | null,
): void => {
    if (!entities) return;
    for (const entity of [
        ...entities.markers,
        ...entities.sticks,
        ...(entities.envelope ? [entities.envelope] : []),
    ]) {
        if (viewer.entities.contains(entity)) {
            viewer.entities.remove(entity);
        }
    }
};

export const loadAquiferWellSceneEntities = (
    viewer: Viewer,
    geometry: AquiferWellSceneGeometry = AQUIFER_WELL_SCENE_GEOMETRY,
): AquiferWellSceneEntities => {
    const markers = geometry.surfaceMarkers.map((marker) =>
        viewer.entities.add({
            id: `aquifer-well-marker-${marker.wellId}`,
            name: marker.wellId,
            properties: {
                aquiferWellId: marker.wellId,
                hasDepthStick: marker.hasDepthStick,
            },
            position: Cartesian3.fromDegrees(
                marker.longitude,
                marker.latitude,
                0,
            ),
            point: {
                pixelSize: marker.hasDepthStick ? 10 : 6,
                color: marker.hasDepthStick ? COLOR_LOGGED : COLOR_COORDINATE,
                outlineColor: Color.WHITE,
                outlineWidth: 1,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: marker.wellId,
                font: "bold 13px sans-serif",
                fillColor: Color.WHITE,
                outlineColor: Color.BLACK,
                outlineWidth: 3,
                style: LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: VerticalOrigin.BOTTOM,
                horizontalOrigin: HorizontalOrigin.CENTER,
                pixelOffset: new Cartesian2(0, -12),
                show: marker.hasDepthStick,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                scaleByDistance: new NearFarScalar(1.0e3, 1.0, 8.0e5, 0.4),
            },
        }),
    );

    const sticks = geometry.wellSticks.map((stick) =>
        viewer.entities.add({
            id: `aquifer-well-stick-${stick.wellId}`,
            name: stick.wellId,
            properties: {
                aquiferWellId: stick.wellId,
                hasDepthStick: true,
            },
            polyline: {
                positions: Cartesian3.fromDegreesArrayHeights([
                    stick.longitude,
                    stick.latitude,
                    aquiferHeightFromDepth(stick.topDepth),
                    stick.longitude,
                    stick.latitude,
                    aquiferHeightFromDepth(stick.bottomDepth),
                ]),
                width: 3,
                material: COLOR_LOGGED.withAlpha(0.95),
            },
        }),
    );

    const { polygon, topDepth, bottomDepth } = geometry.depthEnvelope;
    const envelope =
        polygon.length >= 3
            ? viewer.entities.add({
                  id: "aquifer-depth-envelope",
                  name: "深度包络",
                  properties: {
                      aquiferDepthEnvelope: true,
                  },
                  polygon: {
                      hierarchy: Cartesian3.fromDegreesArray(
                          polygon.flatMap((point) => [
                              point.longitude,
                              point.latitude,
                          ]),
                      ),
                      height: aquiferHeightFromDepth(bottomDepth),
                      extrudedHeight: aquiferHeightFromDepth(topDepth),
                      material: COLOR_ENVELOPE,
                      outline: true,
                      outlineColor: Color.fromCssColorString("#8affd9"),
                      outlineWidth: 2,
                  },
              })
            : null;

    return { markers, sticks, envelope };
};

export const applyAquiferWellHighlight = (
    entities: AquiferWellSceneEntities,
    geometry: AquiferWellSceneGeometry,
    state: AquiferWellHighlightState,
    previousState: AquiferWellHighlightState | null = null,
): void => {
    const loggedIds = new Set(
        geometry.wellSticks.map((stick) => stick.wellId),
    );
    const affectedWellIds = new Set<string>();
    for (const wellId of [
        previousState?.hoveredWellId,
        previousState?.selectedWellId,
        state.hoveredWellId,
        state.selectedWellId,
    ]) {
        if (wellId) affectedWellIds.add(wellId);
    }
    // 首次同步时刷新全部，避免漏状态。
    const updateAll = previousState === null;

    for (const marker of entities.markers) {
        const wellId = readWellId(marker);
        if (!wellId || !marker.point) continue;
        if (!updateAll && !affectedWellIds.has(wellId)) continue;

        const hasDepth = loggedIds.has(wellId);
        const isSelected = wellId === state.selectedWellId;
        const isHovered = wellId === state.hoveredWellId;

        let color = hasDepth ? COLOR_LOGGED : COLOR_COORDINATE;
        let pixelSize = hasDepth ? 10 : 6;
        if (isSelected) {
            color = COLOR_SELECTED;
            pixelSize = hasDepth ? 16 : 12;
        } else if (isHovered) {
            color = COLOR_HOVER;
            pixelSize = hasDepth ? 14 : 10;
        }

        marker.point.pixelSize = new ConstantProperty(pixelSize);
        marker.point.color = new ConstantProperty(color);
        if (marker.label) {
            marker.label.show = new ConstantProperty(
                hasDepth || isSelected || isHovered,
            );
        }
    }

    for (const stick of entities.sticks) {
        const wellId = readWellId(stick);
        if (!wellId || !stick.polyline) continue;
        if (!updateAll && !affectedWellIds.has(wellId)) continue;

        const isSelected = wellId === state.selectedWellId;
        const isHovered = wellId === state.hoveredWellId;

        let width = 3;
        let material = COLOR_LOGGED.withAlpha(0.95);
        if (isSelected) {
            width = 7;
            material = COLOR_SELECTED.withAlpha(0.98);
        } else if (isHovered) {
            width = 6;
            material = COLOR_HOVER.withAlpha(0.98);
        }

        stick.polyline.width = new ConstantProperty(width);
        stick.polyline.material = new ColorMaterialProperty(material);
    }
    // 包络悬停不改材质：半透明体改 alpha 会反馈干扰 pick，导致高频闪烁。
};

export const flyToAquiferWell = async (
    viewer: Viewer,
    wellId: string,
    geometry: AquiferWellSceneGeometry = AQUIFER_WELL_SCENE_GEOMETRY,
): Promise<void> => {
    const marker = geometry.surfaceMarkers.find(
        (item) => item.wellId === wellId,
    );
    if (!marker) return;

    const stick = geometry.wellSticks.find((item) => item.wellId === wellId);
    const depthSpan = stick ? stick.bottomDepth - stick.topDepth : 800;

    await viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
            marker.longitude,
            marker.latitude - 0.12,
            Math.max(12_000, depthSpan * 8 + 6_000),
        ),
        orientation: {
            heading: 0.1,
            pitch: -0.62,
            roll: 0,
        },
        duration: 0.9,
    });
};

export const AQUIFER_WELL_SCENE_INITIAL_CAMERA = {
    destination: {
        longitude: 119.40383145,
        latitude: 32.63077554,
        height: 72056.38,
    },
    orientation: {
        heading: 0.245229,
        pitch: -0.490638,
        roll: 6.283171,
    },
} as const;

export const flyToAquiferWellScene = async (
    viewer: Viewer,
    _geometry: AquiferWellSceneGeometry = AQUIFER_WELL_SCENE_GEOMETRY,
): Promise<void> => {
    const { destination, orientation } = AQUIFER_WELL_SCENE_INITIAL_CAMERA;
    await viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
            destination.longitude,
            destination.latitude,
            destination.height,
        ),
        orientation: {
            heading: orientation.heading,
            pitch: orientation.pitch,
            roll: orientation.roll,
        },
        duration: 1.2,
    });
};
