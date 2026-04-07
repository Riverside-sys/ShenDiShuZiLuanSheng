let timer: any = null
const initPit = async () => {
    clearInterval(timer)
    const buildData = [
        {
            name: '气体监测装置',
            coordinate: [-466.2453, 2191.079102, -71.028015]
        },
        {
            name: '气体监测装置',
            coordinate: [-466.242737, 2209.088379, -71.056267]
        },

        {
            name: '气体监测装置',
            coordinate: [-471.252594, 2217.869385, -71.227814]
        },
        {
            name: '气体监测装置',
            coordinate: [-466.238739, 2224.704834, -70.979248]
        },

        {
            name: '气体监测装置',
            coordinate: [-466.238739, 2232.754883, -70.973907]
        },
        {
            name: '气体监测装置',
            coordinate: [-466.238739, 2241.156494, -71.22403]
        },

        {
            name: '气体监测装置',
            coordinate: [-466.23877, 2267.721924, -71.0532]
        },
        {
            name: '气体监测装置',
            coordinate: [-466.238739, 2272.770996, -71.035324]
        },

        {
            name: '气体监测装置',
            coordinate: [-471.249969, 2281.146729, -71.174675]
        },
        {
            name: '气体监测装置',
            coordinate: [-466.23877, 2286.061035, -71.125099]
        },

        {
            name: '气体监测装置',
            coordinate: [-466.218323, 2317.102539, -70.934868]
        },
        {
            name: '气体监测装置',
            coordinate: [-471.225555, 2312.145996, -71.037804]
        },
        {
            name: '气体监测装置',
            coordinate: [-471.249969, 2323.056641, -71.157158]
        }

    ]
    timer = setInterval(() => {
        if (buildData.length == 0) {
            clearInterval(timer)
        } else {
            const arr: any = buildData.splice(0, 2)
            for (let i = 0; i < 2; i++) {
                if (arr[i]) {
                    addBuildMarker(`point_${i}_${arr[i].coordinate[0]}`, arr[i].coordinate, arr[i].text)
                }
            }
        }
    }, 2000)
}
/**
 * 添加建筑点位
 */
const addBuildMarker = (id: string, coordinate: any, text: string) => {
    // const markerArr: any = []
    // buildData.forEach((item: any, index: number) => {
    const oMarker = {
        id,
        coordinate, //坐标位置
        coordinateType: 0, //默认0是投影坐标系，也可以设置为经纬度空间坐标系值为1
        anchors: [-20, 41 * 1.1], //锚点
        range: [0, 10000000], //可视范围
        imagePath: window.origin + '/img/poi-设备.png', //显示图片路径
        imageSize: [50 * 1.2, 50 * 1.2],
        text, //显示的文字
        useTextAnimation: false, //打开文字展开动画效果
        textRange: [0, 100000], //文本可视范围[近裁距离, 远裁距离]
        textBackgroundColor: [0, 0, 0, 0], //文本背景颜色
        fontSize: 15, //字体大小
        textOffset: [-140, 0, 0],
        fontOutlineSize: 1, //字体轮廓线大小
        fontColor: Color.White, //字体颜色
        fontOutlineColor: Color.Black, //字体轮廓线颜色
        autoHeight: false, // 自动判断下方是否有物体
        displayMode: 2, //显示模式：相机移动时显示，参与避让聚合
        clusterByImage: true, // 聚合时是否根据图片路径分类，即当多个marker的imagePath路径参数相同时按路径对marker分类聚合
        priority: 2, //避让优先级
        occlusionCull: false //是否参与遮挡剔除
    }
    // markerArr.push(oMarker)
    // })
    //添加点
    __g.marker.add(oMarker, null)
}

export { timer, initPit }
