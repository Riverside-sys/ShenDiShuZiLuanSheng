// 图层树隐藏id
const showIdList: any = []
const picture = async () => {
    // getPic();

    // 播放导览
    // playAnimation(16)

    // 延迟1s
    await delay(500)
    playAnimation(16)
    // __g.weather.setDarkMode(true);

    const os: any = []

    const coordinateData = [
        {
            textName: '神东矿区',
            location: [9126.744140625, -7848.8251953125, 5767.4150390625]
        },
        {
            textName: '万利矿区',
            location: [29466.396484375, 5598.96484375, 5767.4150390625]
        },
        {
            textName: '准格尔矿区',
            location: [-4730.22509765625, -19563.03515625, 5767.41259765625]
        },
        {
            textName: '包头矿区',
            location: [-18392.046875, -17710.583984375, 5767.42236328125]
        },
        {
            textName: '乌海矿区',
            location: [-10572.5126953125, -9426.8388671875, 5767.41015625]
        },
        {
            textName: '府谷矿区',
            location: [12041.765625, 3526.472412109375, 5767.41015625]
        },
        {
            textName: '铜川矿区',
            location: [2736.233642578125, 6108.46728515625, 5767.4150390625]
        },
        {
            textName: '榆神矿区',
            location: [-16614.091796875, 6644.8525390625, 5767.40771484375]
        },
        {
            textName: '榆横矿区',
            location: [-28198.884765625, -12220.8173828125, 5767.40771484375]
        },
        {
            textName: '府谷矿区',
            location: [-26924.650390625, -3694.972412109375, 5767.40771484375]
        },
        {
            textName: '吴堡矿区',
            location: [-12147.1806640625, 19610.630859375, 5767.41015625]
        },
        {
            textName: '本溪矿区',
            location: [16954.3359375, 20871.767578125, 5767.41748046875]
        },
        {
            textName: '西昌矿区',
            location: [5600.87744140625, 19864.66015625, 5767.419921875]
        }
    ]
    // 清除3D
    __g.marker3d.clear()
    coordinateData.forEach((item, i) => {
        // console.log(item)
        const o = {
            id: 'm1' + i,
            pointName: 'Point_B_6', //3D标注展示的特效名称
            pointVisible: true, //3D标注是否显示
            pointScale: 1000, //3D标注整体缩放比例
            coordinate: item.location, //3D标注的坐标位置 注意：若坐标Z设置高度为0时 autoHeight=true则会显示在物体上方
            coordinateType: 0, //坐标系类型
            range: [1, 100000000000], //3D标注的可视距离范围：[min,max]，单位：米
            autoHeight: false, //自动判断下方是否有物体，设置正确高度，默认值：false
            text: item.textName, //3D标注显示文字，字符长度范围[0~100]
            textSize: '10000', //3D标注显示文字字体大小，默认值：70
            textColor: '', //3D标注显示文字颜色，支持四种格式，取值示例
            textOutlineSize: '', //3D标注显示文字轮廓大小
            textOutlineColor: '', //3D标注显示文字轮廓颜色，支持四种格式，取值示例
            textFixed: false, //3D标注显示文字是否固定文本朝向，默认值：true
            textVisible: '', //3D标注显示文字是否显示文本，默认值：true
            textLocation: [0, 0, 6000], //文字位置：[X,Y,Z]，取值示例，数组元素类型：(number)，取值范围：[任意数值]
            textRotation: '', //文字旋转：[Pitch,Yaw,Roll]，数组元素类型：(number)，取值范围：[任意数值]
            textScale: '' //文字缩放：[X,Y,Z]，数组元素类型：(number)，取值范围：[任意正整数
        }
        os.push(o)
    })

    await __g.marker3d.add(os)
}

/**
 * 显示正常的图层
 */
const getPic = async () => {
    const tree = await __g.infoTree.get()
    // 显示的图层信息
    const showNameList = ['智慧农业地质层', '智慧农业_底图分块', '智慧农业_底图环境', '智慧农业_底图', '智慧环保底板特效']
    const allLayerId: any = []
    tree.infotree.forEach((item: any, i: any) => {
        allLayerId.push(item.iD)
        if (showNameList.includes(item.name)) showIdList.push(item.iD)
    })
    __g.infoTree.show(showIdList)
}
/**
 * 播放导览
 * @param index
 */
const playAnimation = async (index: number) => {
    await __g.camera.playAnimation(index)
}

/**
 *延迟函数
 *@param time 时间
 */
const delay = (time: number) => {
    return new Promise<void>(resolve => {
        const timer = setTimeout(() => {
            clearTimeout(timer)
            resolve()
        }, time)
    })
}

export { picture }
