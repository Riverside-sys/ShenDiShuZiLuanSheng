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
  ScreenSpaceEventType,
  CameraEventType,
  KeyboardEventModifier
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
      // 静止时不再持续占用 CPU/GPU；相机、加载状态或交互变化时由 Cesium 请求重绘。
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      contextOptions: {
        webgl: {
          alpha: true,
        },
      },
    });

    // 基础设置
    viewer.cesiumWidget.creditContainer.style.display = "none";

    // 相机控制：左键拖拽 = FPS 视角旋转，右键/滚轮 = 推拉缩放
    const cc = viewer.scene.screenSpaceCameraController;
    cc.enableRotate = false; // 关闭"绕地心旋转"——地下场景里没意义
    cc.enableTranslate = false; // 关闭"沿地球表面平移"——它和 WASD 冲突
    cc.enableLook = true;
    cc.lookEventTypes = CameraEventType.LEFT_DRAG;
    cc.tiltEventTypes = [
      CameraEventType.MIDDLE_DRAG,
      CameraEventType.PINCH,
      { eventType: CameraEventType.LEFT_DRAG, modifier: KeyboardEventModifier.CTRL }
    ];
    cc.zoomEventTypes = [
      CameraEventType.RIGHT_DRAG,
      CameraEventType.WHEEL,
      CameraEventType.PINCH
    ];
    cc.inertiaSpin = 0.7;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.backgroundColor = Color.TRANSPARENT;
    viewer.scene.skyAtmosphere.show = false;
    // 只保留后处理 FXAA，避免同时启用两套抗锯齿带来的重复全屏开销。
    viewer.scene.fxaa = false;
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
    const eventHandler = bindEvents(viewer);
    // ScreenSpaceEventHandler 不会随 Viewer 自动释放，显式保存以便路由切换时销毁。
    viewer.__disposePanYiDongEvents = () => {
      if (!eventHandler.isDestroyed()) eventHandler.destroy();
    };

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
  const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(
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
  return handler;
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

// 启用 WASD/QE 键盘漫游控制器
// 返回一个 cleanup 函数，用于解绑事件
export const setupRoamControls = (viewer, options = {}) => {
  if (!viewer) return () => {};

  // 基础移动速度（米/秒）。Cesium 的 moveForward 等接口接收的是米单位
  const baseSpeed = options.baseSpeed ?? 20;
  const fastSpeed = options.fastSpeed ?? 80;

  const keyState = Object.create(null);
  let raf = 0;
  let stopped = false;
  let last = performance.now();

  const shouldIgnoreEvent = (e) => {
    const target = e.target;
    if (!target) return false;
    const tag = (target.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (target.isContentEditable) return true;
    return false;
  };

  const onKeyDown = (e) => {
    if (shouldIgnoreEvent(e)) return;
    const k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "q", "e"].includes(k)) {
      keyState[k] = true;
      e.preventDefault();
      startTicking();
    }
    if (e.key === "Shift") {
      keyState.shift = true;
      startTicking();
    }
  };

  const onKeyUp = (e) => {
    const k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "q", "e"].includes(k)) keyState[k] = false;
    if (e.key === "Shift") keyState.shift = false;
    stopTickingIfIdle();
  };

  const onBlur = () => {
    keyState.w = keyState.a = keyState.s = keyState.d = false;
    keyState.q = keyState.e = keyState.shift = false;
    stopTickingIfIdle();
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  const isMoving = () => keyState.w || keyState.a || keyState.s || keyState.d || keyState.q || keyState.e;

  const tick = () => {
    if (stopped) return;

    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (!viewer || viewer.isDestroyed?.()) return;
    const camera = viewer.scene.camera;
    const step = (keyState.shift ? fastSpeed : baseSpeed) * dt;

    let moved = false;
    if (keyState.w) { camera.moveForward(step); moved = true; }
    if (keyState.s) { camera.moveBackward(step); moved = true; }
    if (keyState.a) { camera.moveLeft(step); moved = true; }
    if (keyState.d) { camera.moveRight(step); moved = true; }
    if (keyState.q) { camera.moveDown(step); moved = true; }
    if (keyState.e) { camera.moveUp(step); moved = true; }

    if (moved) {
      viewer.scene.requestRender();
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
    }
  };

  const startTicking = () => {
    if (!stopped && !raf && isMoving()) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const stopTickingIfIdle = () => {
    if (!isMoving() && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  };
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
