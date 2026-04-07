
import { getLayer, getBorder, getLine1, getLine2, getPoint } from '@/api/integratedSupervision'

// 添加行政区划图层
const addTopLayer = () => {
    const polygonArr: any = []

    getLayer().then((data: any) => {
        data.features.forEach((item: any, index: number) => {
            item.geometry.coordinates.forEach((coordinates: any) => {
                coordinates[0].forEach((item: Array<number>) => {
                    item[2] = 1000
                })
                const top = {
                    id: 'top_polygon_' + index, //polygon唯一标识id
                    coordinates: coordinates[0], //构成polygon的坐标点数组
                    height: 50, //3D多边形的高度
                    material: '/JC_CustomAssets/MaterialLibrary/Exhibition/大理石/MI_BlueMarble01.MI_BlueMarble01', //自定义材质路径
                    vectorParameters: [{ name: '颜色', value: [0.075, 0.373, 0.537] }], //材质数组类型参数
                    scalarParameters: [
                        { name: 'U缩放', value: 0.001 },
                        { name: 'V缩放', value: 0.001 },
                        { name: '饱和度', value: 1 },
                        { name: '高光', value: 0.1 },
                        { name: '亮度', value: 0.5 }
                    ], //材质数值类型参数
                    generateTop: true, //是否生成顶面
                    generateSide: true, //是否生成侧面
                    generateBottom: true //是否生成底面
                }
                polygonArr.push(top)

                const borderCoord = JSON.parse(JSON.stringify(item.geometry.coordinates[0][0]))
                borderCoord.forEach((item: Array<number>) => {
                    item[2] = 1050
                })
                const border = {
                    id: 'top_border_' + index, //polygon唯一标识id
                    coordinates: borderCoord, //构成polygon的坐标点数组
                    color: '#77e3f7',
                    style: 3,
                    intensity: 1,
                    height: 200 //3D多边形的高度
                }
                polygonArr.push(border)
            })
        })
        //批量添加polygon
        __g.polygon3d.add(polygonArr, null)
    })
}

/**
 * 添加底部装饰图层
 */
const addBottomLayer = () => {
    const polygonArr: Array<any> = []
    getBorder().then((data: any) => {
        data.features.forEach((item: any, index: number) => {
            const coordinate1 = JSON.parse(JSON.stringify(item.geometry.coordinates[0][0]))
            // 最底层蓝色-起始高度0，高度80
            coordinate1.forEach((item: Array<number>) => {
                item[2] = 0
            })
            const bottom1 = {
                id: 'bottom1_' + index, //polygon唯一标识id
                coordinates: coordinate1, //构成polygon的坐标点数组
                color: '#122e36',
                style: 2,
                intensity: 1,
                height: 500 //3D多边形的高度
            }
            polygonArr.push(bottom1)

            const coordinate2 = JSON.parse(JSON.stringify(item.geometry.coordinates[0][0]))
            // 2层灰色-起始高度60，高度160
            coordinate2.forEach((item: Array<number>) => {
                item[2] = 200
            })
            const bottom2 = {
                id: 'bottom2_' + index, //polygon唯一标识id
                coordinates: coordinate2, //构成polygon的坐标点数组
                color: [0.2, 0.2, 0.2, 1],
                style: 2,
                height: 600 //3D多边形的高度
            }
            polygonArr.push(bottom2)

            // 3层蓝绿色-起始高度120，高度100
            const coordinate3 = JSON.parse(JSON.stringify(item.geometry.coordinates[0][0]))
            coordinate3.forEach((item: Array<number>) => {
                item[2] = 400
            })
            const bottom3 = {
                id: 'bottom3_' + index, //polygon唯一标识id
                coordinates: coordinate3, //构成polygon的坐标点数组
                color: '#1d8eae',
                style: 4,
                height: 750 //3D多边形的高度
            }
            polygonArr.push(bottom3)
        })

        //批量添加polygon
        __g.polygon3d.add(polygonArr, null)
    })
}
// 添加管廊线路
const addLine = () => {
    getLine1().then((data: any) => {
        const polylineArr: Array<any> = []
        data.features.forEach((item: any, index: number) => {
            item.geometry.coordinates[0].map((item: Array<number>) => {
                item[2] = 800
            })
            const oPolyline = {
                id: 'polyLine1_' + index, //折线唯一标识id
                coordinates: item.geometry.coordinates[0], //构成折线的坐标点数组
                range: [1, 1000000], //可视范围：[近裁距离, 远裁距离]，取值范围: [任意负值, 任意正值]
                color: '#ff5959', //折线颜色
                style: 0, //折线样式 参考样式枚举：PolylineStyle
                thickness: 400, //折线宽度
                intensity: 1, //亮度
                flowRate: 0.1, //流速
                tiling: 0.2, //材质贴图平铺比例
                shape: 1, //折线类型 0：直线， 1：曲线
                depthTest: false //是否做深度检测
            }
            polylineArr.push(oPolyline)
        })
        __g.polyline.add(polylineArr, null)
    })

    getLine2().then((data: any) => {
        const polylineArr: Array<any> = []
        data.features.forEach((item: any, index: number) => {
            item.geometry.coordinates[0].map((item: Array<number>) => {
                item[2] = 800
            })
            const oPolyline = {
                id: 'polyLine2_' + index, //折线唯一标识id
                coordinates: item.geometry.coordinates[0], //构成折线的坐标点数组
                range: [1, 1000000], //可视范围：[近裁距离, 远裁距离]，取值范围: [任意负值, 任意正值]
                color: index % 2 ? '#ffa92e' : '#3a8fff', //折线颜色
                style: 0, //折线样式 参考样式枚举：PolylineStyle
                thickness: 400, //折线宽度
                intensity: 1, //亮度
                flowRate: 0.1, //流速
                tiling: 0.2, //材质贴图平铺比例
                shape: 1, //折线类型 0：直线， 1：曲线
                depthTest: false //是否做深度检测
            }
            polylineArr.push(oPolyline)
        })
        __g.polyline.add(polylineArr, null)
    })
}
// 添加监控中心点位
const addPoint = () => {
    getPoint().then((data: any) => {
        const os: Array<any> = []
        data.features.forEach((item: any, index: number) => {
            item.geometry.coordinates[2] = 1050
            const o = {
                id: 'm1_' + index,
                pointName: index == 0 ? 'Point_R_4' : 'Point_B_6', //3D标注展示的特效名称
                text: index == 0 ? '总矿' : '分矿', //3D标注显示文字
                textSize: 100, //3D标注显示文字大小
                textColor: index == 0 ? [0.8, 0.2, 0.2, 1] : [1, 1, 1, 1], //3D标注显示文字颜色
                textOutlineSize: 5, //3D标注显示文字轮廓大小
                textOutlineColor: [0, 0, 0, 1], // 3D标注显示文字轮廓颜色
                textFixed: false, // 3D标注显示文字是否固定文本朝向
                textVisible: true, //3D标注显示文字是否显示文本
                textLocation: index == 0 ? [0, 0, 3500] : [0, 0, 2500], // 文字位置
                textRotation: [0, 90, 0], // 文字旋转
                pointVisible: true, //3D标注是否显示
                pointScale: index == 0 ? 600 : 400, //3D标注整体缩放比例
                coordinate: item.geometry.coordinates, //3D标注的坐标位置 注意：若坐标Z设置高度为0时 autoHeight=true则会显示在物体上方
                coordinateType: 0, //坐标系类型
                range: [1, 1000000], //3D标注的可视距离范围：[min,max]，单位：米
                autoHeight: false //自动判断下方是否有物体，设置正确高度，默认值：false
            }
            os.push(o)
        })
        __g.marker3d.add(os, null)
    })
}

const addAdministrativeRegion = () => {
    addTopLayer()
    addBottomLayer()
    // addLine()
    addPoint()
}

export {
    addAdministrativeRegion
}