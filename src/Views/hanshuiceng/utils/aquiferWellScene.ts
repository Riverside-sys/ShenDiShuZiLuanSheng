import {
    Cartesian2,
    Cartesian3,
    Color,
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

/** 场景以椭球高 0 为近似地面；测深向下为正，故高度 = -depth。 */
export const aquiferHeightFromDepth = (depthMeters: number): number =>
    -depthMeters;

export interface AquiferWellSceneEntities {
    readonly markers: Entity[];
    readonly sticks: Entity[];
    readonly envelope: Entity | null;
}

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
            position: Cartesian3.fromDegrees(
                marker.longitude,
                marker.latitude,
                0,
            ),
            point: {
                pixelSize: marker.hasDepthStick ? 10 : 6,
                color: marker.hasDepthStick
                    ? Color.fromCssColorString("#65f6c5")
                    : Color.fromCssColorString("#00d8ff"),
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
                material: Color.fromCssColorString("#65f6c5").withAlpha(0.95),
            },
        }),
    );

    const { polygon, topDepth, bottomDepth } = geometry.depthEnvelope;
    const envelope =
        polygon.length >= 3
            ? viewer.entities.add({
                  id: "aquifer-depth-envelope",
                  polygon: {
                      hierarchy: Cartesian3.fromDegreesArray(
                          polygon.flatMap((point) => [
                              point.longitude,
                              point.latitude,
                          ]),
                      ),
                      // Cesium: height = 底，extrudedHeight = 顶
                      height: aquiferHeightFromDepth(bottomDepth),
                      extrudedHeight: aquiferHeightFromDepth(topDepth),
                      material: Color.fromCssColorString("#26d9ff").withAlpha(
                          0.22,
                      ),
                      outline: true,
                      outlineColor: Color.fromCssColorString("#8affd9"),
                      outlineWidth: 2,
                  },
              })
            : null;

    return { markers, sticks, envelope };
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
