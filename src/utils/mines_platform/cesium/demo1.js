import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { pointStore } from "@/stores/modules/point.js";
const pointStores = pointStore();
export var viewer;
let primitiveArr = [];
import poup from "./poup.js";
export let popups;
import * as tagwork from "../mapData/tag.js";
import {
    defineProps,
    toRaw,
    ref,
    watch,
    onMounted,
    nextTick,
    onUnmounted,
} from "vue";
import * as windwork from "../mapData/wind.js";
import * as turf from "@turf/turf";

export const placeDiv = (color, image, arrData) => {
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        const position = Cesium.Cartesian3.fromDegrees(
            item.position[0],
            item.position[1],
            item.position[2]
        );
        const entity = viewer.entities.add({
            position: position,
            billboard: {
                image: image,
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: color,
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });

        // 为"中央变电所"添加特殊点击事件
        if (item.name === "中央变电所") {
            // 添加单击事件监听
            const handler = new Cesium.ScreenSpaceEventHandler(
                viewer.scene.canvas
            );

            // 单击事件 - 显示进入按钮
            handler.setInputAction((event) => {
                const pickedObject = viewer.scene.pick(event.position);
                if (
                    Cesium.defined(pickedObject) &&
                    pickedObject.id === entity
                ) {
                    // 显示进入按钮
                    showEnterButton(event.position, item);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // 双击事件 - 直接跳转（保持原有功能）
            handler.setInputAction((event) => {
                const pickedObject = viewer.scene.pick(event.position);
                if (
                    Cesium.defined(pickedObject) &&
                    pickedObject.id === entity
                ) {
                    console.log("双击图标:", item.name);
                    // 触发路由跳转
                    if (window.location) {
                        window.location.hash = "#/mesh-viewer";
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }

        // 为"填充回采工作面"添加特殊点击事件
        if (item.name === "填充回采工作面") {
            // 添加单击事件监听
            const handler = new Cesium.ScreenSpaceEventHandler(
                viewer.scene.canvas
            );

            // 单击事件 - 显示进入按钮
            handler.setInputAction((event) => {
                const pickedObject = viewer.scene.pick(event.position);
                if (
                    Cesium.defined(pickedObject) &&
                    pickedObject.id === entity
                ) {
                    // 显示进入按钮
                    showEnterButton(event.position, item);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // 双击事件 - 直接跳转（保持原有功能）
            handler.setInputAction((event) => {
                const pickedObject = viewer.scene.pick(event.position);
                if (
                    Cesium.defined(pickedObject) &&
                    pickedObject.id === entity
                ) {
                    console.log("双击图标:", item.name);
                    // 触发路由跳转
                    if (window.location) {
                        window.location.hash = "#/mesh-viewer";
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }

        // 为"避难硐室"添加特殊点击事件
        if (item.name === "避难硐室") {
            // 添加单击事件监听
            const handler = new Cesium.ScreenSpaceEventHandler(
                viewer.scene.canvas
            );

            // 单击事件 - 显示进入按钮
            handler.setInputAction((event) => {
                const pickedObject = viewer.scene.pick(event.position);
                if (
                    Cesium.defined(pickedObject) &&
                    pickedObject.id === entity
                ) {
                    // 显示进入按钮
                    showEnterButton(event.position, item);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // 双击事件 - 直接跳转（保持原有功能）
            handler.setInputAction((event) => {
                const pickedObject = viewer.scene.pick(event.position);
                if (
                    Cesium.defined(pickedObject) &&
                    pickedObject.id === entity
                ) {
                    console.log("双击图标:", item.name);
                    // 触发路由跳转
                    if (window.location) {
                        window.location.hash = "#/mesh-viewer";
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }

        // 为"消防器材库"添加特殊点击事件
        if (item.name === "消防器材库") {
            // 添加单击事件监听
            const handler = new Cesium.ScreenSpaceEventHandler(
                viewer.scene.canvas
            );

            // 单击事件 - 显示进入按钮
            handler.setInputAction((event) => {
                const pickedObject = viewer.scene.pick(event.position);
                if (
                    Cesium.defined(pickedObject) &&
                    pickedObject.id === entity
                ) {
                    // 显示进入按钮
                    showEnterButton(event.position, item);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // 双击事件 - 直接跳转（保持原有功能）
            handler.setInputAction((event) => {
                const pickedObject = viewer.scene.pick(event.position);
                if (
                    Cesium.defined(pickedObject) &&
                    pickedObject.id === entity
                ) {
                    console.log("双击图标:", item.name);
                    // 触发路由跳转
                    if (window.location) {
                        window.location.hash = "#/mesh-viewer";
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }

        // 为"3106综放工作面"添加特殊点击事件
        if (item.name === "3106综放工作面") {
            // 添加单击事件监听
            const handler = new Cesium.ScreenSpaceEventHandler(
                viewer.scene.canvas
            );

            // 单击事件 - 显示进入按钮
            handler.setInputAction((event) => {
                const pickedObject = viewer.scene.pick(event.position);
                if (
                    Cesium.defined(pickedObject) &&
                    pickedObject.id === entity
                ) {
                    // 显示进入按钮
                    showEnterButton(event.position, item);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // 双击事件 - 直接跳转（保持原有功能）
            handler.setInputAction((event) => {
                const pickedObject = viewer.scene.pick(event.position);
                if (
                    Cesium.defined(pickedObject) &&
                    pickedObject.id === entity
                ) {
                    console.log("双击图标:", item.name);
                    // 触发路由跳转
                    if (window.location) {
                        window.location.hash = "#/mesh-viewer";
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }
    }
};

// 显示进入按钮的函数
const showEnterButton = (position, item) => {
    // 移除已存在的按钮
    const existingButton = document.getElementById("enter-button");
    if (existingButton) {
        existingButton.remove();
    }

    // 创建进入按钮
    const button = document.createElement("div");
    button.id = "enter-button";
    button.innerHTML = `进入${item.name}`;
    button.style.cssText = `
        position: fixed;
        left: ${position.x + 10}px;
        top: ${position.y - 30}px;
        background: #17c7fe;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
    `;

    // 添加悬停效果
    button.addEventListener("mouseenter", () => {
        button.style.background = "#0fa8d4";
        button.style.transform = "scale(1.05)";
    });

    button.addEventListener("mouseleave", () => {
        button.style.background = "#17c7fe";
        button.style.transform = "scale(1)";
    });

    // 点击进入按钮
    button.addEventListener("click", () => {
        console.log("点击进入按钮:", item.name);
        // 触发容器替换事件
        if (window.dispatchEvent) {
            window.dispatchEvent(
                new CustomEvent("switchToMeshViewer", {
                    detail: { item: item },
                })
            );
        }
        // 移除按钮
        button.remove();
    });

    // 点击其他地方移除按钮
    const removeButton = (e) => {
        if (e.target !== button) {
            button.remove();
            document.removeEventListener("click", removeButton);
        }
    };

    // 延迟添加事件监听，避免立即触发
    setTimeout(() => {
        document.addEventListener("click", removeButton);
    }, 100);

    document.body.appendChild(button);
};

// 初始化地图
export const init = (id) => {
    Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNTUxMTJhNy0wN2I3LTRkOGMtODUwNS1mYTVlZDBjZjQxZmMiLCJpZCI6MjExODExLCJpYXQiOjE3MTkzNzI3MTN9.9PLuJMbIUtJe3WNDxxzsvNvJTVEJbaJTytOCjkwAMcU";
    viewer = new Cesium.Viewer(id, {
        shouldAnimate: false,
        animation: false, //是否显示动画控件
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        fullscreenButton: false, //是否显示全屏按钮
        infoBox: false, //是否显示点击要素之后显示的信息
        homeButton: false, //是否显示Home按钮
        shadows: false,
        baseLayer: undefined,
        terrainProvider: undefined,
        contextOptions: {
            webgl: {
                alpha: true,
            },
        },
    });
    viewer.cesiumWidget.creditContainer.style.display = "none";
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#0A253D");
    // viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;

    //关闭大气
    viewer.scene.skyAtmosphere.show = false;
    // //抗锯齿
    viewer.scene.fxaa = true;
    viewer.scene.postProcessStages.fxaa.enabled = true;

    viewer.scene.sun.show = false; //在Cesium1.6(不确定)之后的版本会显示太阳和月亮，不关闭会影响展示
    viewer.scene.moon.show = false;
    viewer.scene.skyBox.show = false; //关闭天空盒，否则会显示天空颜色
    // 隐藏地球
    viewer.scene.undergroundMode = true; //重要，开启地下模式，设置基色透明，这样就看不见黑色地球了
    viewer.scene.globe.show = false; //不显示地球，这条和地球透明度选一个就可以

    viewer.imageryLayers.get(0).alpha = 0; // 显示地球透明度，[0,1]
    viewer.scene.globe.translucency.backFaceAlpha = 0;
    viewer.scene.globe.translucency.enabled = true;
    // viewer.scene.globe.baseColor = Cesium.Color.TRANSPARENT;
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0A253D");
    // viewer.scene.requestRenderMode = true;
    // viewer.scene.maximumRenderTimeChange = Infinity;

    //启用光照效果(别删，测试使用)
    // viewer.scene.shadowMap.enabled = false;
    // viewer.scene.globe.enableLighting = false;
    // viewer.scene.globe.showGroundAtmosphere = false;
    // viewer.scene.globe.baseColor = Cesium.Color.TRANSPARENT;
    // viewer.scene.globe.translucency.enabled = true;
    // viewer.scene.globe.translucency.frontFaceAlpha = 0.5;

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            112.963339058676,
            36.03932170484385,
            2244.5538536173
        ),
        orientation: {
            heading: 0.38107987593720516,
            pitch: -0.5622042421863807,
            roll: 6.28308871967003,
        },
        duration: 1,
    });

    const position = Cesium.Cartesian3.fromDegrees(112.97, 36.06, 330);
    const heading = Cesium.Math.toRadians(90);
    const pitch = Cesium.Math.toRadians(0);
    const roll = Cesium.Math.toRadians(0);
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr
    );

    // 加载 GLB 模型
    const modelEntity = viewer.entities.add({
        name: "dashujdhkasjhdkjsahdkjas",
        position: position,
        orientation: orientation,
        model: {
            uri: "./3cad/NoLod_0.glb",
            scale: 0.85, // 模型整体缩放比例
            minimumPixelSize: 128,
            maximumScale: 20000,
            shadows: Cesium.ShadowMode.DISABLED,
            clampToGround: true,
        },
    });
    const point = viewer.entities.add({
        name: "dashujdhkasjhdkjsahdkjas",
        position: Cesium.Cartesian3.fromDegrees(
            112.976594628761,
            36.082723712917335,
            0
        ),
        point: {
            show: false,
            // pixelSize: 10,
            // color: Cesium.Color.RED,
            // outlineColor: Cesium.Color.WHITE,
            // outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            // disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
    });

    // 点击获取空间信息
    new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas).setInputAction(
        (event) => {
            var pick = viewer.scene.pick(event.position);
            // 获取地球表面点击坐标
            // let earthPosition = viewer.camera.pickEllipsoid(
            //     event.position,
            //     viewer.scene.globe.ellipsoid
            // );
            // 获取模型点击坐标
            let earthPosition = viewer.scene.pickPosition(event.position);
            if (Cesium.defined(pick)) {
                console.log("pick: ", pick);
            }
            let goePt = Cesium.Cartographic.fromCartesian(earthPosition);
            let latitude = Cesium.Math.toDegrees(goePt.latitude);
            let longitude = Cesium.Math.toDegrees(goePt.longitude);
            let height = goePt.height;
            let position = Cesium.Cartesian3.fromDegrees(
                longitude,
                latitude,
                height
            );
            console.log("xiangji:", viewer.scene.camera.directionWC);
            console.log(
                "heading:",
                viewer.scene.camera.heading,
                ",pitch:",
                viewer.scene.camera.pitch,
                ",roll:",
                viewer.scene.camera.roll
            );
            console.log("WGS84:", longitude + "," + latitude + "," + height);
            console.log(
                "笛卡尔:",
                position.x + "," + position.y + "," + position.z
            );
            //获取相机参数
            const camera = viewer.scene.camera;
            const cartographic = Cesium.Cartographic.fromCartesian(
                camera.position
            );
            const x = Cesium.Math.toDegrees(cartographic.longitude);
            const y = Cesium.Math.toDegrees(cartographic.latitude);
            const z = cartographic.height;
            let pt = Cesium.Cartographic.fromDegrees(x, y, z);
            let ellipsoid = viewer.scene.globe.ellipsoid;
            let cartesian3 = ellipsoid.cartographicToCartesian(pt);
            console.log("相机参数获取：");
            console.log(
                "heading:",
                camera.heading,
                ",pitch:",
                camera.pitch,
                ",roll:",
                camera.roll
            );
            console.log("WGS84:", x + "," + y + "," + z);
            console.log(
                "笛卡尔:",
                cartesian3.x + "," + cartesian3.y + "," + cartesian3.z
            );
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
    );

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((e) => {
        e.endPosition = new Cesium.Cartesian2(
            e.endPosition.x + 310,
            e.endPosition.y + 175
        );
        let pickedObject = viewer.scene.pickPosition(e.endPosition);
        if (pickedObject) {
            viewer.container.style.cursor = "pointer";
        } else {
            viewer.container.style.cursor = "default";
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction((e) => {
        e.position = new Cesium.Cartesian2(
            e.position.x + 310,
            e.position.y + 175
        );
        const clickPosition = viewer.scene.pickPosition(e.position);
        if (clickPosition) {
            viewer.container.style.cursor = "pointer";
        } else {
            viewer.container.style.cursor = "default";
        }
        let cartographic = Cesium.Cartographic.fromCartesian(clickPosition);
        let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let alt = cartographic.height;
        console.log(
            "坐标点位",
            formatNumberWithoutRounding(lon),
            formatNumberWithoutRounding(lat),
            formatNumberWithoutRounding(alt)
        );

        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 飞行到模型位置
    viewer.trackedEntity = point;
    popups = new poup({
        viewer: viewer,
        className: "bx-popup-ctn2",
    });

    // //  if (item.data) {
    //     // arrData.some((item1) => {
    //     //   if (item1.data.pointLocation) {
    //         popups.add({
    //           geometry: Cesium.Cartesian3.fromDegrees(
    //             item1.position[0],
    //             item1.position[1],
    //             item1.position[2]
    //           ),
    //           content: {
    //             header: `${item1.name}`,
    //             content: `<div class="firetcBox">

    //             <div class="firetcItem"><div>测点名称：</div> <div class="rightItemText">${lon}</div></div>
    //             <div class="firetcItem"><div>检测值：  </div> <div style="color:#FEC21F">${lat}</div> </div>
    //             <div class="firetcItem"><div>更新时间：</div> <div class="rightItemText">${alt}</div></div>
    //             </div>`
    //           },
    //           isclose: true
    //         });
    //     //   }
    //     // });
    //   // }
};

// 格式化数字，保留小数点后7位
function formatNumberWithoutRounding(num) {
    const numStr = num.toString();
    const [integerPart, decimalPart] = numStr.split(".");
    if (decimalPart && decimalPart.length > 7) {
        return parseFloat(`${integerPart}.${decimalPart.slice(0, 7)}`);
    }
    return parseFloat(numStr);
}

// 水泵房
const arrData = [
    {
        name: "等候室",
        position: [112.96698301159265, 36.06605823867122, 321.7787328],
    },
    {
        name: "等候室2",
        position: [112.97072717369713, 36.070783642595885, 321.7425075],
    },
    { name: "等候室", position: [112.9731914, 36.0613864, 320.2434988] },
];
export const fireDiv = (arrData) => {
    console.log(arrData);
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        viewer.entities.add({
            id: item.name + i,
            position: Cesium.Cartesian3.fromDegrees(
                item.position[0],
                item.position[1],
                item.position[2]
            ),
            billboard: {
                image: "/config/fireIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#B8290D"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
        if (item.data) {
            arrData.some((item1) => {
                if (item1.data.pointLocation) {
                    popups.add({
                        geometry: Cesium.Cartesian3.fromDegrees(
                            item1.position[0],
                            item1.position[1],
                            item1.position[2]
                        ),
                        content: {
                            header: `${item1.name}`,
                            content: `<div class="firetcBox">

              <div class="firetcItem"><div>测点名称：</div> <div class="rightItemText">${item1.data.pointCode ? item1.data.pointCode : ""
                                }</div></div>
              <div class="firetcItem"><div>检测值：  </div> <div style="color:#FEC21F">${item1.data.rtValue ? item1.data.rtValue : 0
                                }</div> </div>
              <div class="firetcItem"><div>更新时间：</div> <div class="rightItemText">${item1.data.csDataTime ? item1.data.csDataTime : ""
                                }</div></div>
              </div>`,
                        },
                        isclose: true,
                    });
                }
            });
        }
    }
};
export const floodDiv = (arrData) => {
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        const position = Cesium.Cartesian3.fromDegrees(
            item.position[0],
            item.position[1],
            item.position[2]
        );
        viewer.entities.add({
            position: position,
            billboard: {
                image: "/config/floodIcon.png",
                scale: 1.0,
                id: "myBillboard",
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#0E84B7"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
        if (item.data) {
            arrData.some((item1) => {
                popups.add({
                    geometry: Cesium.Cartesian3.fromDegrees(
                        item1.position[0],
                        item1.position[1],
                        item1.position[2]
                    ),
                    content: {
                        header: `${item1.name}`,
                        content: `<div class="gastcBox" style="height:213px">
              <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>测点位置：</div> <div class="rightItemText">${item1.name ? item1.name : ""
                            }</div> </div>
              <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>监测值：</div> <div class="rightItemText" style="color:rgba(255, 190, 50, 1)">${item1.data.rtValue ? item1.data.rtValue : ""
                            } m³/h</div> </div>
              <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>测点名称：</div> <div class="rightItemText">${item1.name ? item1.name : ""
                            }</div> </div>
              <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>更新时间：</div> <div class="rightItemText">${item1.data.csDataTime ? item1.data.csDataTime : ""
                            }</div> </div>
               </div>
                  `,
                    },
                    isclose: true,
                });
            });
        }
    }
};
export const sersorDiv = (arrData) => {
    // console.log('arrData', arrData)
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        const position = Cesium.Cartesian3.fromDegrees(
            item.position[0],
            item.position[1],
            item.position[2]
        );
        viewer.entities.add({
            position: position,
            billboard: {
                image: "/config/sensorIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#4B507B"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
        if (item.data) {
            arrData.some((item1) => {
                popups.add({
                    geometry: Cesium.Cartesian3.fromDegrees(
                        item1.position[0],
                        item1.position[1],
                        item1.position[2]
                    ),
                    content: {
                        header: `${item1.name}`,
                        content: `<div class="gastcBox" style="height:213px">
          <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>测点位置：</div> <div class="rightItemText">${item1.data.pointAreaName ? item1.data.pointAreaName : ""
                            }</div> </div>
          <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>监测值：</div> <div class="rightItemText" style="color:rgba(255, 190, 50, 1)">${item1.data.crValue ? item1.data.crValue : ""
                            }</div> </div>
          <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>测点名称：</div> <div class="rightItemText">${item1.name ? item1.name : ""
                            }</div> </div>
           <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>更新时间：</div> <div class="rightItemText">${item1.data.csDataTime ? item1.data.csDataTime : ""
                            }</div> </div>
                        </div>
                          `,
                    },
                    isclose: true,
                });
            });
        }
        // (function(entity, item) {
        //   handler.setInputAction(function(movement) {
        //     let pickedObject = viewer.scene.pick(movement.position);
        //     if (Cesium.defined(pickedObject) && pickedObject.id === entity) {
        //       console.log('Entity clicked:', item.name);
        //     }
        //   }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // })(entity, item);
    }
};
export const peopleDiv = (arrData) => {
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        const position = Cesium.Cartesian3.fromDegrees(
            item.position[0],
            item.position[1],
            item.position[2]
        );
        viewer.entities.add({
            position: position,
            billboard: {
                image: "./config/xiaoren-3.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#CC640D"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
        if (item.data) {
            arrData.some((item1) => {
                console.log("item1===>", toRaw(item1.data));
                if (item1.data.psPersonName || item1.data.title) {
                    popups.add({
                        geometry: Cesium.Cartesian3.fromDegrees(
                            item.position[0],
                            item.position[1],
                            item.position[2]
                        ),
                        content: {
                            header: `${item1.data.psPersonName}`,
                            content: `<div class="gastcBox" style="height:213px">
            <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>人员名称：</div> <div class="rightItemText">${item1.data.psPersonName ? item1.data.psPersonName : ""
                                }</div> </div>
            <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>人员编码：</div> <div class="rightItemText">${item1.data.psPersonCard ? item1.data.psPersonCard : ""
                                }</div> </div>
            <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>所属部门：</div> <div class="rightItemText">
            ${item1.data.psPersonDept ? item1.data.psPersonDept : ""
                                }</div> </div>
            <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>人联系方式：</div> <div class="rightItemText">${item1.data.psPersonPhone ? item1.data.psPersonPhone : ""
                                }</div> </div>
                          </div>
                            `,
                        },
                        isclose: true,
                    });
                }
            });
        }
    }
};

// export const peopleDiv = (arrData) => {
//   for (let i = 0; i < arrData.length; i++) {
//     const item = arrData[i];

//     viewer.entities.add({
//       id: item.name + i,
//       position: Cesium.Cartesian3.fromDegrees(item.position[0], item.position[1], item.position[2]),
//       billboard: {
//         image: './config/xiaoren-3.png',
//         scale: 1.0,
//         horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
//         verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
//         disableDepthTestDistance: Number.POSITIVE_INFINITY,
//       },
//       label: {
//         text: item.name,
//         font: '16px sans-serif',
//         showBackground: true,
//         backgroundColor: Cesium.Color.fromCssColorString('#CC640D'),
//         backgroundPadding: new Cesium.Cartesian2(7, 7),
//         pixelOffset: new Cesium.Cartesian2(1.0, -100),
//         fillColor: Cesium.Color.WHITE.withAlpha(0.75),
//         scale: 1.0,
//         disableDepthTestDistance: Number.POSITIVE_INFINITY,
//       }
//     });
//     if (item.data) {
//       console.log("item==>",item)
//       arrData.some((item1) => {
//         console.log("item1==>",item)
//         if ( item.name) {
//           popups.add({
//             geometry: Cesium.Cartesian3.fromDegrees(
//               item1.position[0],
//             item1.position[1],
//             item1.position[2]
//             ),
//             content: {
//               header: `${item.name}`,
//               content: `<div class="gastcBox" style="height:213px">
//             <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>人员名称：</div> <div class="rightItemText">${item.data.title ? item.data.title : ''}</div> </div>
//             <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>人员编码：</div> <div class="rightItemText">${item.data.psPersonCard ? item.data.psPersonCard : ''}</div> </div>
//             <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>所属部门：</div> <div class="rightItemText">${item1.data.parent.node.title ? item1.data.parent.node.title :''}</div> </div>
//              <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>联系方式：</div> <div class="rightItemText">${item.data2? item.data2 : ''}</div> </div>
//                            </div>
//                             `
//             },
//             isclose: true
//           });
//         }
//       });
//    }
//   }
// };

export const baseDiv = (arrData) => {
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        const position = Cesium.Cartesian3.fromDegrees(
            item.position[0],
            item.position[1],
            item.position[2]
        );
        viewer.entities.add({
            position: position,
            billboard: {
                image: "config/dongIcon1.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#B36915"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
        if (item.data) {
            arrData.some((item1) => {
                popups.add({
                    geometry: Cesium.Cartesian3.fromDegrees(
                        item1.position[0],
                        item1.position[1],
                        item1.position[2]
                    ),
                    content: {
                        header: `${item1.name}`,
                        content: `<div class="gastcBox" style="height:213px">
          <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>基站位置：</div> <div class="rightItemText">${item1.data.psStationLocation ? item1.data.psStationLocation : ""
                            }</div> </div>
          <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>基站名称：</div> <div class="rightItemText">${item1.data.psStationName ? item1.data.psStationName : ""
                            }</div> </div>
          <div class="firetcItem2" style="border-bottom:1px solid #45AEFF"><div>基站编码：</div> <div class="rightItemText">${item1.data.psStationCode ? item1.data.psStationCode : ""
                            }</div> </div>
                        </div>
                          `,
                    },
                    isclose: true,
                });
            });
        }
    }
};
export const videoDiv = (arrData) => {
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        const position = Cesium.Cartesian3.fromDegrees(
            item.position[0],
            item.position[1],
            item.position[2]
        );
        viewer.entities.add({
            position: position,
            billboard: {
                image: "./config/videoIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#1EB730"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
        if (item.data) {
            arrData.some((item1) => {
                popups.add({
                    geometry: Cesium.Cartesian3.fromDegrees(
                        item1.position[0],
                        item1.position[1],
                        item1.position[2]
                    ),
                    content: {
                        header: `${item1.name}`,
                        //   content: `<div class="vidoetcBox">
                        //           <div class="videos">
                        //       <flv :id="'${item1.data.id}'" :rtsp-url="'${item1.data.vedioAddress}'"></flv>
                        //           </div>
                        //         <div class="vidoeInfo">
                        //          <div class="infoItem"><div>摄像头名称：</div><div class="rightItemText">${item1.data.monitorName ? item1.data.monitorName : ''}</div></div>
                        //          <div class="infoItem"><div>摄像头地址：</div><div class="rightItemText">${item1.data.monitorName ? item1.data.monitorName : ''}</div></div>
                        //          <div class="infoItem"><div>摄像头型号：</div><div class="rightItemText">${item1.data.monitorModel ? item1.data.monitorModel : ''}</div></div>
                        //          <div class="infoItem"><div>更新时间：</div><div class="rightItemText">${item1.data.updateTime ? item1.data.updateTime : ''}</div></div>
                        //         </div>
                        //             </div>
                        //
                        content: `<div class="gastcBox" style="height:213px">
          <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>摄像头名称：</div> <div class="rightItemText">${item1.data.monitorName ? item1.data.monitorName : ""
                            }</div> </div>
          <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>摄像头地址：</div> <div class="rightItemText">${item1.data.monitorName ? item1.data.monitorName : ""
                            }</div> </div>
          <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>摄像头型号：</div> <div class="rightItemText">${item1.data.monitorModel ? item1.data.monitorModel : ""
                            }</div> </div>
           <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>更新时间：</div> <div class="rightItemText">${item1.data.updateTime ? item1.data.updateTime : ""
                            }</div> </div>
                        </div>
                          `,
                    },

                    isclose: true,
                });
            });
        }
    }
};
export const minePressureDiv = (arrData) => {
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        const position = Cesium.Cartesian3.fromDegrees(
            item.position[0],
            item.position[1],
            item.position[2]
        );

        viewer.entities.add({
            position: position,
            billboard: {
                image: "/config/minePressure.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#1EA5A8"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
        if (item.data) {
            arrData.some((item1) => {
                popups.add({
                    geometry: Cesium.Cartesian3.fromDegrees(
                        item1.position[0],
                        item1.position[1],
                        item1.position[2]
                    ),
                    content: {
                        header: `${item1.name}`,
                        content: `<div class="gastcBox" style="height:213px">
            <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>测点名称：</div> <div class="rightItemText">${item1.data.sensorLocationStr ? item1.data.sensorLocationStr : ""
                            }</div> </div>
            <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>测点位置：</div> <div class="rightItemText">${item1.name ? item1.name : ""
                            }</div> </div>
            <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>实时值：</div> <div class="rightItemText" style="color:rgba(255, 190, 50, 1)">${item1.data.pointValue ? item1.data.pointValue : ""
                            }MPa</div> </div>
            <div class="firetcItem" style="border-bottom:1px solid #45AEFF"><div>记录时间：</div> <div class="rightItemText">${item1.data.dateTime ? item1.data.dateTime : ""
                            }</div> </div>
                          </div>
                            `,
                    },
                    isclose: true,
                });
            });
        }
    }
};
export const phoneDiv = (arrData) => {
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        const position = Cesium.Cartesian3.fromDegrees(
            item.position[0],
            item.position[1],
            item.position[2]
        );
        viewer.entities.add({
            position: position,
            billboard: {
                image: "/config/phoneIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#215FED"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
    }
};
export const radioDiv = (arrData) => {
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        const position = Cesium.Cartesian3.fromDegrees(
            item.position[0],
            item.position[1],
            item.position[2]
        );
        viewer.entities.add({
            position: position,
            billboard: {
                image: "/config/radioIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#9822CA"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
    }
};
export const deviceDiv = (arrData) => {
    for (let i = 0; i < arrData.length; i++) {
        const item = arrData[i];
        const position = Cesium.Cartesian3.fromDegrees(
            item.position[0],
            item.position[1],
            item.position[2]
        );
        viewer.entities.add({
            position: position,
            billboard: {
                image: "/config/baseIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                text: item.name,
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#18B67C"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
    }
};
export const flyTo = (arr, heading, pitch, roll, duration) => {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(arr[0], arr[1], arr[2]),
        orientation: {
            heading: Cesium.Math.toRadians(heading),
            pitch: Cesium.Math.toRadians(pitch),
            roll: Cesium.Math.toRadians(roll),
        },
        duration: duration,
    });
};

export const flyTo1 = (arr, heading, pitch, roll, duration) => {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            arr[0],
            arr[1] - 0.004,
            arr[2] + 120
        ),
        orientation: {
            heading: Cesium.Math.toRadians(heading),
            pitch: Cesium.Math.toRadians(pitch),
            roll: Cesium.Math.toRadians(roll),
        },
        duration: duration,
    });
};

export const clear = () => {
    if (viewer) {
        // popups.closeAll();
        viewer.entities.removeAll(); // 清除所有实体

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                112.963339058676,
                36.03932170484385,
                2244.5538536173
            ),
            orientation: {
                heading: 0.38107987593720516,
                pitch: -0.5622042421863807,
                roll: 6.28308871967003,
            },
            duration: 1,
        });

        const position = Cesium.Cartesian3.fromDegrees(112.97, 36.06, 330);
        const heading = Cesium.Math.toRadians(90);
        const pitch = Cesium.Math.toRadians(0);
        const roll = Cesium.Math.toRadians(0);
        const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(
            position,
            hpr
        );

        // 加载 GLB 模型
        const modelEntity = viewer.entities.add({
            name: "dashujdhkasjhdkjsahdkjas",
            position: position,
            orientation: orientation,
            model: {
                uri: "./3cad/NoLod_0.glb",
                scale: 0.85, // 模型整体缩放比例
                minimumPixelSize: 128,
                maximumScale: 20000,
                shadows: Cesium.ShadowMode.DISABLED,
                clampToGround: true,
            },
        });
        primitiveArr.forEach((item) => {
            viewer.scene.primitives.remove(item);
        });
    }
};

var enterColor = Cesium.Color.DARKORANGE;
var returnColor = Cesium.Color.LIME;
var enterUrl = "/public/img/textures/arrow-h2.png";
var returnUrl = "/public/img/textures/arrow-h2.png";

// 通风
const Air = (color, url, returnAirArr, repeat) => {
    const instance = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(returnAirArr),
            width: 15,
        }),
    });
    Cesium.Material.PolylineTrailLinkType = "PolylineTrailLink";
    Cesium.Material.PolylineTrailLinkImage = url;
    Cesium.Material.PolylineTrailLinkSource = `czm_material czm_getMaterial(czm_materialInput materialInput)
  {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float time = fract(czm_frameNumber * speed / 1000.0 + startTime);
      float offset = fract(st.s*repeat - time);
      vec4 colorImage = texture2D(image, vec2(fract(st.s + offset), st.t));
      float glow = power / abs(st.t - 0.5) - (power / 0.5);
      material.alpha = colorImage.a * color.a * clamp(0.0, 1.0, glow);
      material.diffuse = (colorImage.rgb+color.rgb)/2.0;
      return material;
  }`;
    let primitivewind = viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: [instance],
            appearance: new Cesium.PolylineMaterialAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: Cesium.Material.PolylineTrailLinkType,
                        uniforms: {
                            color: color,
                            image: Cesium.Material.PolylineTrailLinkImage,
                            startTime: 0.5,
                            speed: 12,
                            repeat: repeat,
                            power: 0.35,
                        },
                        source: Cesium.Material.PolylineTrailLinkSource,
                    },
                }),
            }),
        })
    );
    primitiveArr.push(primitivewind);
};

//启动通风演示
export const wind = () => {
    // showFlowLine(windwork.enterAirArr, 769.4)
    // showFlowLine(windwork.enterAirArr1, 810.4)
    // showFlowLine(windwork.enterAirArr2, 751.3)
    // showFlowLine(windwork.enterAirArr3, 769.8)
    // showFlowLine(windwork.enterAirArr4, 817.3)
    // showFlowLine(windwork.enterAirArr5, 817.3)
    // showFlowLine(windwork.enterAirArr6, 427.2)
    // showFlowLine(windwork.enterAirArr7, 578.4)
    // showFlowLine(windwork.enterAirArr701, 578.4)
    // showFlowLine(windwork.enterAirArr801, 518.3)
    // showFlowLine(windwork.enterAirArr802, 518.3)
    // showFlowLine(windwork.enterAirArr9, 427.3)
    // showFlowLine(windwork.enterAirArr10, 427.3)
    // showFlowLine1(windwork.returnAirArr, 804.1)
    // showFlowLine1(windwork.returnAirArr01, 753)
    // showFlowLine1(windwork.returnAirArr1, 825.4)
    // showFlowLine1(windwork.returnAirArr2, 825.4)
    // showFlowLine1(windwork.returnAirArr3, 825.4)
    // showFlowLine1(windwork.returnAirArr4, 825.4)
};

const getNewXY = (startPoint, endPoint, d, h) => {
    let distance = getDistance(endPoint, startPoint);
    let x3 = startPoint[0] + (d * (endPoint[0] - startPoint[0])) / distance;
    let y3 = startPoint[1] + (d * (endPoint[1] - startPoint[1])) / distance;
    return [x3, y3, h];
};

const getNewXYZ = (originalPoint, d, h) => {
    const direction = [0.6, 0.8, 0]; // 方向向量，假设已经是一个单位向量
    const dx = direction[0];
    const dy = direction[1];
    const dz = direction[2];
    // 确保方向向量是单位向量，如果不是，则需要先归一化
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const normalizedDx = dx / length;
    const normalizedDy = dy / length;
    const normalizedDz = dz / length;

    // 计算新坐标
    const newX = x + d * normalizedDx;
    const newY = y + d * normalizedDy;
    const newZ = z + d * normalizedDz;

    return [newX, newY, newZ];
};

const getDistance = (pointAE, pointAS) => {
    // 计算两点间的距离
    const dx = pointAE[0] - pointAS[0];
    const dy = pointAE[1] - pointAS[1];
    const dz = pointAE[2] - pointAS[2];
    //return Math.sqrt(dx * dx + dy * dy + dz * dz);
    return Math.sqrt(dx * dx + dy * dy);
};

const showFlowLine = (pointArrs, h, imageColor, imageUrl) => {
    const firstPoint = pointArrs[0];
    const endPoint = pointArrs[1];
    const distance = getDistance(endPoint, firstPoint);
    const unitD = 0.0004757544438215466;
    const num = distance / unitD;
    let endArrs = [];
    for (let i = 0; i < num + 1; i++) {
        let startArr = getNewXY(firstPoint, endPoint, i * unitD, h);
        //let endArr = getNewXY(firstPoint,endPoint,(i+1)*unitD);
        endArrs = endArrs.concat(startArr);
    }
    Air(enterColor, enterUrl, endArrs, num);
};

const showFlowLine1 = (pointArrs, h, imageColor, imageUrl) => {
    const firstPoint = pointArrs[0];
    const endPoint = pointArrs[1];
    const distance = getDistance(endPoint, firstPoint);
    const unitD = 0.0004757544438215466;
    const num = distance / unitD;
    let endArrs = [];
    for (let i = 0; i < num + 1; i++) {
        let startArr = getNewXY(firstPoint, endPoint, i * unitD, h);
        //let endArr = getNewXY(firstPoint,endPoint,(i+1)*unitD);
        endArrs = endArrs.concat(startArr);
    }
    Air(returnColor, returnUrl, endArrs, num);
};

const getRepeat = (pointBE, pointBS, pointAE, pointAS, repeatA) => {
    const A_DISTNACE = getDistance(pointAE, pointAS);
    const B_DISTNACE = getDistance(pointBE, pointBS);
    const repeatB = (B_DISTNACE * repeatA) / A_DISTNACE;
    return repeatB;
};
// 水灾
const floodArr = [];
const floodEscapeData = ref([]);
// 水灾定时器
var times = null;
// 水灾
export const floods = () => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((e) => {
        e.endPosition = new Cesium.Cartesian2(
            e.endPosition.x + 110,
            e.endPosition.y + 90
        );
        let pickedObject = viewer.scene.pickPosition(e.endPosition);
        if (pickedObject) {
            viewer.container.style.cursor = "pointer";
        } else {
            viewer.container.style.cursor = "default";
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction((e) => {
        console.log("e", e);
        e.position = new Cesium.Cartesian2(
            e.position.x + 110,
            e.position.y + 90
        );
        const clickPosition = viewer.scene.pickPosition(e.position);
        console.log("clickPosition水灾", clickPosition);
        let cartographic = Cesium.Cartographic.fromCartesian(clickPosition);
        let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let alt = cartographic.height;
        console.log(lon, lat, alt);
        pointStores.floodChange(clickPosition);
        floodEscapeData.value.push(lon);
        floodEscapeData.value.push(lat);
        floodEscapeData.value.push(alt);
        floodArr.push(lon);
        floodArr.push(lat);
        floodArr.push(alt);
        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, alt + 15),
            point: {},
            billboard: {
                image: "/config/floodIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
            label: {
                text: "水灾点",
                font: "16px normal normal 楷体",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#0E84B7"),
                fillColor: Cesium.Color.WHITE,
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                scale: 1.0,
            },
        });
        var oDiv = document.getElementById("mousediv");
        oDiv.style.display = "none";
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
// 水灾监测点
export const addDemoGraphic2 = () => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((e) => {
        e.endPosition = new Cesium.Cartesian2(
            e.endPosition.x + 110,
            e.endPosition.y + 90
        );
        let pickedObject = viewer.scene.pickPosition(e.endPosition);
        if (pickedObject) {
            viewer.container.style.cursor = "pointer";
        } else {
            viewer.container.style.cursor = "default";
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction((e) => {
        console.log("e", e);
        e.position = new Cesium.Cartesian2(
            e.position.x + 110,
            e.position.y + 90
        );
        const clickPosition = viewer.scene.pickPosition(e.position);
        let cartographic = Cesium.Cartographic.fromCartesian(clickPosition);
        console.log("randiansPos", cartographic);
        let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let alt = cartographic.height;
        floodEscapeData.value.push(lon);
        floodEscapeData.value.push(lat);
        floodEscapeData.value.push(alt);

        pointStores.floodMeasurementChange(clickPosition);

        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, alt + 15),
            // new Cesium.Cartesian3(clickPosition.x, clickPosition.y, clickPosition.z),
            point: {
                // dimensions: new Cesium.Cartesian3(8.0, 8.0, 8.0),
                // color: Cesium.Color.fromCssColorString('#ff0000')
            },
            billboard: {
                image: "config/dongIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
            label: {
                text: "监测点",
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#D57316"),
                fillColor: Cesium.Color.WHITE,
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                scale: 1.0,
            },
        });
        var oDiv = document.getElementById("mousediv2");
        oDiv.style.display = "none";
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
// 启动水灾仿真
export const startflood = () => {
    // 扩散墙
    var scale = 1;
    var minimumHeights = ref([]);
    viewer.entities.add({
        name: "扩散",
        wall: {
            show: true,
            minimumHeights: new Cesium.CallbackProperty(function () {
                return minimumHeights.value;
            }, false),
            positions: new Cesium.CallbackProperty(function () {
                scale += 0.015;
                if (scale >= 3.0) {
                    scale = 1;
                }
                var radius = 20;
                var options = { steps: 10, units: "meters" };
                var circle = turf.circle(
                    [floodArr[0], floodArr[1]],
                    radius,
                    options
                );
                var scaledPoly = turf.transformScale(circle, scale);
                var newPositions = [];
                minimumHeights.value = [];
                for (
                    let i = 0;
                    i < scaledPoly.geometry.coordinates[0].length;
                    i++
                ) {
                    scaledPoly.geometry.coordinates[0][i].forEach(function (
                        element
                    ) {
                        newPositions.push(element);
                    });
                    newPositions.push(floodArr[2] + 10);
                    minimumHeights.value.push(floodArr[2]);
                }

                return Cesium.Cartesian3.fromDegreesArrayHeights(newPositions);
            }, false), //按比例缩放
            material: Cesium.Color.fromCssColorString("#04C5C8").withAlpha(0.5),
        },
    });

    const secondTimer = setTimeout(() => {
        startflood1(floodEscapeData.value, 10);
    }, 1000);
    times = setTimeout(() => {
        run(floodEscapeData.value);
    }, 2000);
};
// 水灾逃生路线背景
const startflood1 = (floodArr, repeat) => {
    const instance = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(floodArr),
            width: 35,
        }),
    });
    let primitive = viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: [instance],
            appearance: new Cesium.PolylineMaterialAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: "Water",
                        uniforms: {
                            baseWaterColor:
                                Cesium.Color.fromCssColorString(
                                    "#04C5C8"
                                ).withAlpha(0.5),
                            animationSpeed: 0.01,
                            amplitude: 0.5,
                        },
                    },
                }),
            }),
        })
    );
    primitiveArr.push(primitive);
    const instance1 = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(floodArr),
            width: 100,
        }),
    });
    Cesium.Material.PolylineTrailLinkType = "PolylineTrailLink";
    Cesium.Material.PolylineTrailLinkImage = "/public/img/red.png"; //图片 图片为箭头
    Cesium.Material.PolylineTrailLinkSource = `czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = fract(czm_frameNumber * speed / 1000.0 + startTime);
    float offset = fract(st.s*repeat - time);
    vec4 colorImage = texture2D(image, vec2(fract(st.s + offset), st.t));
    material.alpha = colorImage.a * color.a;
    material.diffuse = (colorImage.rgb+color.rgb)/2.0;
    return material;
}`;
    let primitiveArrow = viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: [instance1],
            appearance: new Cesium.PolylineMaterialAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: Cesium.Material.PolylineTrailLinkType,
                        uniforms: {
                            color: Cesium.Color.RED,
                            image: Cesium.Material.PolylineTrailLinkImage,
                            startTime: 0.5,
                            speed: 13,
                            repeat: 15,
                        },
                        source: Cesium.Material.PolylineTrailLinkSource,
                    },
                }),
            }),
        })
    );
    primitiveArr.push(primitiveArrow);
};
// 关闭水灾仿真
export const closeflood = () => {
    clear();
    pointStores.floodMeasurementClear();
    pointStores.floodClear();
    clearInterval(times);
    floodEscapeData.value = [];
};
// 逃生路线（人员移动）
const computeCirclularFlight = (arr, start) => {
    var j = 0;
    const property = new Cesium.SampledPositionProperty();
    for (let i = 0; i < arr.length * 60; i += 60) {
        const radians = Cesium.Math.toRadians(i);
        const time = Cesium.JulianDate.addSeconds(
            start,
            i,
            new Cesium.JulianDate()
        );
        const position = Cesium.Cartesian3.fromDegrees(
            arr[j][0],
            arr[j][1],
            arr[j][2]
        );
        j++;
        property.addSample(time, position);
    }
    return property;
};
const run = (arr) => {
    const start = Cesium.JulianDate.fromDate(new Date());
    const end = Cesium.JulianDate.addSeconds(
        start,
        60,
        new Cesium.JulianDate()
    );
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = end.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    viewer.clock.multiplier = 10;
    viewer.clock.shouldAnimate = true;
    const position = computeCirclularFlight(
        [
            [arr[0], arr[1], arr[2]],
            [arr[3], arr[4], arr[5]],
        ],
        start
    );
    viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({ start: start, stop: end }),
        ]),
        position: position,
        orientation: new Cesium.VelocityOrientationProperty(position),
        path: {
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
                color: Cesium.Color.AQUA.withAlpha(0.3),
            }),
            width: 0,
        },
        billboard: {
            image: "/public/config/xiaoren.png",
            scale: 0.1, // 根据需要调整大小
            clampToTileset: true,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
    });
};
// 火灾
const fireArr = [];
const fireEscapeData = ref([]);
// 火灾灾定时器
var times1 = [];
//  火灾
export const fire = () => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((e) => {
        e.endPosition = new Cesium.Cartesian2(
            e.endPosition.x + 110,
            e.endPosition.y + 90
        );
        let pickedObject = viewer.scene.pickPosition(e.endPosition);
        if (pickedObject) {
            viewer.container.style.cursor = "pointer";
        } else {
            viewer.container.style.cursor = "default";
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction((e) => {
        console.log("e", e);
        e.position = new Cesium.Cartesian2(
            e.position.x + 110,
            e.position.y + 90
        );
        const clickPosition = viewer.scene.pickPosition(e.position);
        let cartographic = Cesium.Cartographic.fromCartesian(clickPosition);
        console.log("randiansPos", cartographic);
        let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let alt = cartographic.height;
        console.log(lon, lat, alt);
        pointStores.fireChange(clickPosition);
        fireEscapeData.value.push(lon);
        fireEscapeData.value.push(lat);
        fireEscapeData.value.push(alt);

        fireArr.push(lon);
        fireArr.push(lat);
        fireArr.push(alt);
        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, alt + 15),
            point: {
                // pixelSize: 10,
                // color: Cesium.Color.RED
            },
            billboard: {
                image: "/config/fireIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
            label: {
                text: "火灾点",
                font: "16px normal normal 楷体",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#B8290D"),
                fillColor: Cesium.Color.WHITE,
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                scale: 1.0,
            },
        });
        var oDiv = document.getElementById("mousediv2");
        oDiv.style.display = "none";
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
// 火灾监测点
export const addDemoGraphic3 = () => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((e) => {
        e.endPosition = new Cesium.Cartesian2(
            e.endPosition.x + 110,
            e.endPosition.y + 90
        );
        let pickedObject = viewer.scene.pickPosition(e.endPosition);
        if (pickedObject) {
            viewer.container.style.cursor = "pointer";
        } else {
            viewer.container.style.cursor = "default";
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction((e) => {
        console.log("e", e);
        e.position = new Cesium.Cartesian2(
            e.position.x + 110,
            e.position.y + 90
        );
        const clickPosition = viewer.scene.pickPosition(e.position);
        let cartographic = Cesium.Cartographic.fromCartesian(clickPosition);
        console.log("randiansPos", cartographic);
        let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let alt = cartographic.height;
        fireEscapeData.value.push(lon);
        fireEscapeData.value.push(lat);
        fireEscapeData.value.push(alt);

        pointStores.fireMeasurementChange(clickPosition);
        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, alt + 15),
            point: {},
            billboard: {
                image: "config/dongIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
            label: {
                text: "监测点",
                font: "16px sans-serif",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#D57316"),
                fillColor: Cesium.Color.WHITE,
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                scale: 1.0,
            },
        });
        var oDiv = document.getElementById("mousediv2");
        oDiv.style.display = "none";
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
//启动火灾仿真
export const startfire = () => {
    // 扩散墙
    var scale = 1;
    var minimumHeights = ref([]);
    viewer.entities.add({
        name: "扩散",
        wall: {
            show: true,
            minimumHeights: new Cesium.CallbackProperty(function () {
                return minimumHeights.value;
            }, false),
            positions: new Cesium.CallbackProperty(function () {
                scale += 0.015;
                if (scale >= 3.0) {
                    scale = 1;
                }
                var radius = 20;
                var options = { steps: 10, units: "meters" };
                var circle = turf.circle(
                    [fireArr[0], fireArr[1]],
                    radius,
                    options
                );
                var scaledPoly = turf.transformScale(circle, scale);
                var newPositions = [];
                minimumHeights.value = [];
                for (
                    let i = 0;
                    i < scaledPoly.geometry.coordinates[0].length;
                    i++
                ) {
                    scaledPoly.geometry.coordinates[0][i].forEach(function (
                        element
                    ) {
                        newPositions.push(element);
                    });
                    newPositions.push(fireArr[2] + 10);
                    minimumHeights.value.push(fireArr[2]);
                }

                return Cesium.Cartesian3.fromDegreesArrayHeights(newPositions);
            }, false), //按比例缩放
            material: Cesium.Color.fromCssColorString("#ff0000").withAlpha(0.5),
        },
    });

    setTimeout(() => {
        startfire1(fireEscapeData.value, 10);
    }, 1000);
    times1 = setInterval(() => {
        run(fireEscapeData.value);
    }, 3800);
};
// 火灾逃生路线背景
const startfire1 = (fireArr, repeat) => {
    const instance = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(fireArr),
            width: 35,
        }),
    });
    let primitive = viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: [instance],
            appearance: new Cesium.PolylineMaterialAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: "Water",
                        uniforms: {
                            baseWaterColor:
                                Cesium.Color.fromCssColorString(
                                    "#04C5C8"
                                ).withAlpha(0.5),
                            animationSpeed: 0.01,
                            amplitude: 0.5,
                        },
                    },
                }),
            }),
        })
    );
    primitiveArr.push(primitive);
    const instance1 = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(fireArr),
            width: 100,
        }),
    });
    Cesium.Material.PolylineTrailLinkType = "PolylineTrailLink";
    Cesium.Material.PolylineTrailLinkImage = "/public/img/red.png"; //图片 图片为箭头
    Cesium.Material.PolylineTrailLinkSource = `czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = fract(czm_frameNumber * speed / 1000.0 + startTime);
    float offset = fract(st.s*repeat - time);
    vec4 colorImage = texture2D(image, vec2(fract(st.s + offset), st.t));
    material.alpha = colorImage.a * color.a;
    material.diffuse = (colorImage.rgb+color.rgb)/2.0;
    return material;
}`;
    let primitiveArrow = viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: [instance1],
            appearance: new Cesium.PolylineMaterialAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: Cesium.Material.PolylineTrailLinkType,
                        uniforms: {
                            color: Cesium.Color.RED,
                            image: Cesium.Material.PolylineTrailLinkImage,
                            startTime: 0.5,
                            speed: 13,
                            repeat: 15,
                        },
                        source: Cesium.Material.PolylineTrailLinkSource,
                    },
                }),
            }),
        })
    );
    primitiveArr.push(primitiveArrow);
};
// 关闭火灾仿真
export const closefire = () => {
    clear();
    pointStores.fireClear();
    pointStores.fireMeasurementClear();
    clearInterval(times1);
    fireEscapeData.value = [];
};
// 人员定位
const peopleArr = ref([]);
export const refugepoint = () => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((e) => {
        e.position = new Cesium.Cartesian2(e.position.x + 40, e.position.y);
        const clickPosition = viewer.scene.pickPosition(e.position);
        // console.log('clickPosition', clickPosition)
        let cartographic = Cesium.Cartographic.fromCartesian(clickPosition);
        let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let alt = cartographic.height;
        console.log(lon, lat, alt);
        // pointStores.floodChange(clickPosition)
        // floodEscapeData.value.push(lon)
        // floodEscapeData.value.push(lat)
        // floodEscapeData.value.push(alt)
        peopleArr.value.push(lon);
        peopleArr.value.push(lat);
        peopleArr.value.push(alt);

        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, alt + 10),
            polyline: {
                width: 5,
                material: Cesium.Color.RED,
            },
            billboard: {
                image: "/config/floodIcon.png",
                scale: 1.0,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
            label: {
                text: "避灾点",
                font: "16px normal normal 楷体",
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#0E84B7"),
                backgroundPadding: new Cesium.Cartesian2(7, 7),
                pixelOffset: new Cesium.Cartesian2(1.0, -100),
                fillColor: Cesium.Color.WHITE,
                scale: 1.0,
            },
        });
        if (peopleArr.value.length >= 6) {
            var oDiv = document.getElementById("mousediv1");
            oDiv.style.display = "none";
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
// startPeople
export const startPeople = () => {
    setTimeout(() => {
        run(toRaw(peopleArr.value));
    }, 2500);
};

export const closePeople = () => {
    peopleArr.value = [];
    clear();
    pointStores.peoplepointClear();
};

export const startMove = () => {
    setTimeout(() => {
        move(peopleArr.value);
    }, 1000);
};

export const move = (arr) => {
    const instance = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(arr),
            width: 20,
        }),
    });
    let primitive = viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: [instance],
            appearance: new Cesium.PolylineMaterialAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: "Water",
                        uniforms: {
                            baseWaterColor:
                                Cesium.Color.fromCssColorString(
                                    "#04C5C8"
                                ).withAlpha(0.5),
                            animationSpeed: 0.01,
                            amplitude: 0.5,
                        },
                    },
                }),
            }),
        })
    );
    primitiveArr.push(primitive);
    const start = Cesium.JulianDate.fromDate(new Date());
    const end = Cesium.JulianDate.addSeconds(
        start,
        60,
        new Cesium.JulianDate()
    );
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = end.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    viewer.clock.multiplier = 10;
    viewer.clock.shouldAnimate = true;
    const position = computeCirclularFlight(
        [
            [arr[0], arr[1], arr[2]],
            [arr[3], arr[4], arr[5]],
        ],
        start
    );
    viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({ start: start, stop: end }),
        ]),
        position: position,
        orientation: new Cesium.VelocityOrientationProperty(position),
        path: {
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
                // glowPower: 0.1,
                color: Cesium.Color.AQUA.withAlpha(0.3),
            }),
            width: 0,
        },
        billboard: {
            image: "/public/config/xiaoren.png",
            scale: 0.1, // 根据需要调整大小
            clampToTileset: true,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
    });

    const instance1 = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(arr),
            width: 100,
        }),
    });
    Cesium.Material.PolylineTrailLinkType = "PolylineTrailLink";
    Cesium.Material.PolylineTrailLinkImage = "/public/img/red.png"; //图片 图片为箭头
    Cesium.Material.PolylineTrailLinkSource = `czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = fract(czm_frameNumber * speed / 1000.0 + startTime);
    float offset = fract(st.s*repeat - time);
    vec4 colorImage = texture2D(image, vec2(fract(st.s + offset), st.t));
    material.alpha = colorImage.a * color.a;
    material.diffuse = (colorImage.rgb+color.rgb)/2.0;
    return material;
}`;
    let primitiveArrow = viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: [instance1],
            appearance: new Cesium.PolylineMaterialAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: Cesium.Material.PolylineTrailLinkType,
                        uniforms: {
                            color: Cesium.Color.RED,
                            image: Cesium.Material.PolylineTrailLinkImage,
                            startTime: 0.5,
                            speed: 13,
                            repeat: 13,
                        },
                        source: Cesium.Material.PolylineTrailLinkSource,
                    },
                }),
            }),
        })
    );
    primitiveArr.push(primitiveArrow);
};
