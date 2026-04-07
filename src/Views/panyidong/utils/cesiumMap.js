import {
  Viewer,
  Color,
  Cartesian3,
  Ion,
  ScreenSpaceEventHandler,
  defined,
  Cartographic,
  Math as CesiumMath,
  HeadingPitchRoll,
  Transforms,
  ScreenSpaceEventType
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// 场景初始化函数
export const initCesiumScene = async (container, modelPath) => {
  try {
    if (!container) return null;

    Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNTUxMTJhNy0wN2I3LTRkOGMtODUwNS1mYTVlZDBjZjQxZmMiLCJpZCI6MjExODExLCJpYXQiOjE3MTkzNzI3MTN9.9PLuJMbIUtJe3WNDxxzsvNvJTVEJbaJTytOCjkwAMcU";

    const viewer = new Viewer(container, {
      shouldAnimate: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      timeline: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      homeButton: false,
      shadows: false,
      baseLayer: undefined,
      terrainProvider: undefined,
      contextOptions: {
        webgl: {
          alpha: true,
        },
      },
    });

    // 基础设置
    viewer.cesiumWidget.creditContainer.style.display = "none";
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.backgroundColor = Color.TRANSPARENT;
    viewer.scene.skyAtmosphere.show = false;
    viewer.scene.fxaa = true;
    viewer.scene.postProcessStages.fxaa.enabled = true;
    viewer.scene.sun.show = false;
    viewer.scene.moon.show = false;
    viewer.scene.skyBox.show = false;
    viewer.scene.undergroundMode = true;
    viewer.scene.globe.show = false;
    viewer.imageryLayers.get(0).alpha = 0;
    viewer.scene.globe.translucency.backFaceAlpha = 0;
    viewer.scene.globe.translucency.enabled = true;
    viewer.scene.globe.baseColor = Color.TRANSPARENT;

    // 加载模型
    const position = Cartesian3.fromDegrees(112.97, 36.06, 330);
    const heading = CesiumMath.toRadians(90);
    const pitch = CesiumMath.toRadians(0);
    const roll = CesiumMath.toRadians(0);
    const hpr = new HeadingPitchRoll(heading, pitch, roll);
    const orientation = Transforms.headingPitchRollQuaternion(
      position,
      hpr
    );

    const modelEntity = viewer.entities.add({
      name: "PanYiDong Model",
      position: position,
      orientation: orientation,
      model: {
        uri: modelPath,
        scale: 5,
        minimumPixelSize: 128,
        maximumScale: 20000,
        shadows: "DISABLED",
        clampToGround: true,
      },
    });

    // 绑定事件（点击拾取坐标等）
    bindEvents(viewer);

    viewer.scene.requestRender();

    onResetView(viewer);

    return viewer;
  } catch (error) {
    console.error("初始化失败:", error);
    return null;
  }
};

// 内部使用的事件绑定函数
function bindEvents(viewer) {
  new ScreenSpaceEventHandler(viewer.scene.canvas).setInputAction(
    (event) => {
      const pick = viewer.scene.pick(event.position);
      const earthPosition = viewer.scene.pickPosition(event.position);

      if (defined(pick)) {
        console.log("pick: ", pick);
      }

      if (defined(earthPosition)) {
        const goePt = Cartographic.fromCartesian(earthPosition);
        const latitude = CesiumMath.toDegrees(goePt.latitude);
        const longitude = CesiumMath.toDegrees(goePt.longitude);
        const height = goePt.height;
        const pos = Cartesian3.fromDegrees(longitude, latitude, height);

        console.log("WGS84:", `${longitude},${latitude},${height}`);
        console.log("笛卡尔:", `${pos.x},${pos.y},${pos.z}`);
      }

      const camera = viewer.scene.camera;
      const cartographic = Cartographic.fromCartesian(camera.position);
      const longitude = CesiumMath.toDegrees(cartographic.longitude);
      const latitude = CesiumMath.toDegrees(cartographic.latitude);
      const height = cartographic.height;

      const heading = camera.heading;
      const pitch = camera.pitch;
      const roll = camera.roll;

      console.log("--- 当前相机视角参数 ---");
      console.log("位置:", `${longitude}, ${latitude}, ${height}`);
      console.log("姿态(弧度):", `H:${heading}, P:${pitch}, R:${roll}`);
      console.log("姿态(度):", `H:${CesiumMath.toDegrees(heading)}, P:${CesiumMath.toDegrees(pitch)}, R:${CesiumMath.toDegrees(roll)}`);
    },
    ScreenSpaceEventType.LEFT_CLICK
  );
}

// 场景重置函数
export const onResetView = async (viewer) => {
  if (!viewer) return;

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(
      112.96918586122746,
      36.05796254438261,
      -1858.2567589392359
    ),
    orientation: {
      heading: 0.02959353018364652,
      pitch: 1.3246913103321447,
      roll: 0.00007107538938555535,
    },
    duration: 0.01,
  });

  viewer.scene.requestRender();
};

const position1 = {
  destination: Cartesian3.fromDegrees(
    112.969694073084,
    36.05991575209808,
    -1525.6322592243264
  ),
  orientation: {
    heading: 4.712428348805074,
    pitch: 1.3649694854143046,
    roll: 4.699536148505884
  },
  duration: 1,
}

const position2 = {
  destination: Cartesian3.fromDegrees(
    112.9698858585541,
    36.05984869010259,
    -9.033332413753476
  ),
  orientation: {
    heading: 0.020888476614141283,
    pitch: 1.3203824948415814,
    roll: 0.00003715973386597682,
  },
  duration: 1,
}

const position3 = {
  destination: Cartesian3.fromDegrees(
    112.96947092041681,
    36.059753447065766,
    -2502.475392364768
  ),
  orientation: {
    heading: 6.244588899545535,
    pitch: 1.3713422651628362,
    roll: 0.000020849278723922282,
  },
  duration: 1,
}

// 相机漫游函数
export const startRoaming = (viewer) => {
  if (!viewer) return;

  const flyDuration = 1; // 漫游飞行时间
  const stopDuration = 1500; // 停留时间

  // 飞向位置1
  viewer.camera.flyTo({
    ...position1,
    duration: flyDuration,
    complete: () => {
      setTimeout(() => {
        // 飞向位置2
        viewer.camera.flyTo({
          ...position2,
          duration: flyDuration,
          complete: () => {
            setTimeout(() => {
              // 飞向位置3
              viewer.camera.flyTo({
                ...position3,
                duration: flyDuration,
              });
            }, stopDuration);
          },
        });
      }, stopDuration);
    },
  });
};

export const flyToPosition = (viewer, positionKey) => {
  if (!viewer) return;

  let targetPosition;
  switch (positionKey) {
    case 'position1':
      targetPosition = position1;
      break;
    case 'position2':
      targetPosition = position2;
      break;
    case 'position3':
      targetPosition = position3;
      break;
    default:
      return;
  }

  if (targetPosition) {
    viewer.camera.flyTo({
      ...targetPosition,
      duration: 1.5
    });
  }
}
