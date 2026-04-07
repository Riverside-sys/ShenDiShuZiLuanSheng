import { defineStore } from 'pinia'
import { ref,reactive } from 'vue'

export const pointStore = defineStore(
  'point',
  () => {
    // 人员定位
    const people = ref({})
    const setPeople = (_people) => {
      people.value = _people
    }
    //设备
    const base = ref({})
    const setBase = (_base) => {
      base.value = _base
    }
    // 基站
    const bases = ref({})
    const setBases = (_bases) => {
      bases.value = _bases
    }

    // 视频
    const video = ref({})
    const videoChange = (_video) => {
      video.value = _video
    }
    // 广播
    const broadcast = ref({})
    const broadcastChange = (_broadcast) => {
      broadcast.value = _broadcast
    }
    // 电话
    const phone = ref({})
    const phoneChange = (_phone) => {
      phone.value = _phone
    }
    //  监测点
    const point = ref({})
    const pointChange = (_ponit) => {
      point.value = _ponit
    }

    //水灾点
    const flood = ref([])
    const floodChange = (e) => {
      flood.value = e
    }
    const floodClear = (e) => {
      flood.value = []
    }

    const floodMeasurement = ref([])
    const floodMeasurementChange = (e) => {
      floodMeasurement.value = e
    }
    const floodMeasurementClear = () => {
      floodMeasurement.value = []
    }

    // 火灾点
    const fire = ref([])
    const fireChange = (e) => {
      fire.value = e
    }
    const fireClear = (e) => {
      fire.value = []
    }

    const fireMeasurement = ref([])
    const fireMeasurementChange = (e) => {
      fireMeasurement.value = e
    }
    const fireMeasurementClear = () => {
      fireMeasurement.value = []
    }

    const points = ref({})
    const pointsChange = (_ponits) => {
      points.value = _ponits
    }

    // 视频链接
    const videoUrls = ref('')
    const videoUrlsChange = (_videoUrls) => {
      videoUrls.value = _videoUrls
    }

    // 新水灾
    const newflood = ref({})
    const newfloodChange = (_newflood) => {
      newflood.value = _newflood
    }

    // 新火灾
    const newfire = ref({})
    const newfireChange = (_newfire) => {
      newfire.value = _newfire
    }

    // 新矿压
    const newminePressure = ref({})
    const newminePressureChange = (_newminePressure) => {
      newminePressure.value = _newminePressure
    }
    // 新视频
    const newvideo = ref({})
    const newvideoChange = (_newvideo) => {
      newvideo.value = _newvideo
    }
    // 新人员
    const newpeople = ref({})
    const newpeopleChange = (_newpeople) => {
      newpeople.value = _newpeople
    }
    // 新基站
    const newbase = ref({})
    const newbaseChange = (_newbase) => {
      newbase.value = _newbase
    }

    // 新瓦斯
    const newgas = ref({})
    const newgasChange = (_newgas) => {
      newgas.value = _newgas
    }

    const peoplepointArr = ref([])
    const peoplepointChange = (_peoplepointArr) => {
      peoplepointArr.value.push(_peoplepointArr)
    }
    const peoplepointClear = () => {
      peoplepointArr.value =[]
    }



    const sensor = ref({})
    const sensorChange = (_sensor) => {
      sensor.value = _sensor
    }

    //  控制右边侧边栏显隐的对象
    const rightShow = ref(false)
    const rightShowChange = (_rightShow) => {
      rightShow.value = _rightShow
    }

    const rightShowClear= (_rightShow) => {
      rightShow.value =false
    }


    const rightShow2 = ref(false)
    const rightShowChange2 = (_rightShow2) => {
      rightShow2.value = _rightShow2
    }

    const rightShowClear2= (_rightShow2) => {
      rightShow2.value =false
    }



    //  控制矿压右边侧边栏显隐的对象
    const minRightShowData = ref({})
    const minrightShowChange = (_minRightShowData) => {
      minRightShowData.value = _minRightShowData
    }
    const minRightShowDataClear= (_minRightShowData) => {
      minRightShowData.value ={}
    }


    const fireRightShowData = ref({})
    const firerightShowChange = (_fireRightShowData) => {
      fireRightShowData.value = _fireRightShowData
    }
    const fireRightShowDataClear= (_fireRightShowData) => {
      fireRightShowData.value ={}
    }

    const floodRightShowData = ref({})
    const floodRightShowDataChange = (_floodRightShowData) => {
      floodRightShowData.value = _floodRightShowData
    }
    const floodRightShowDataClear= (_floodRightShowData) => {
      floodRightShowData.value ={}
    }

    const peopleRightShowData = ref({})
    const peopleRightShowDataChange = (_peopleRightShowData) => {
      peopleRightShowData.value = _peopleRightShowData
    }
    const peopleRightShowDataClear= (_peopleRightShowData) => {
      peopleRightShowData.value ={}
    }

    const baseRightShowData = ref({})
    const baseRightShowDataChange = (_baseRightShowData) => {
      baseRightShowData.value = _baseRightShowData
    }
    const baseRightShowDataClear= (_baseRightShowData) => {
      baseRightShowData.value ={}
    }

    
    const baserightShow = ref(false)
    const baserightShowChange = (_baserightShow) => {
      baserightShow.value = _baserightShow
    }

    const baserightShowClear= (_baserightShow) => {
      baserightShow.value =false
    }


    const sensorRightShowData = ref({})
    const sensorRightShowDataChange = (_sensorRightShowData) => {
      sensorRightShowData.value = _sensorRightShowData
    }
    const sensorRightShowDataClear= (_sensorRightShowData) => {
      sensorRightShowData.value ={}
    }


    const gasRightShowData = ref({})
    const gasRightShowDataChange = (_gasRightShowData) => {
      gasRightShowData.value = _gasRightShowData
    }
    const gasRightShowDataClear= (_gasRightShowData) => {
      gasRightShowData.value ={}
    }


    const videoRightShowData = ref({})
    const videoRightShowDataChange = (_videoRightShowData) => {
      videoRightShowData.value = _videoRightShowData
    }
    const videoRightShowDataClear= (_videoRightShowData) => {
      videoRightShowData.value ={}
    }

    

    return {
      people,
      base,
      bases,
      setPeople,
      setBase,
      setBases,
      video,
      videoChange,
      broadcast,
      broadcastChange,
      phone,
      phoneChange,
      point,
      pointChange,
      flood,
      floodChange,
      floodMeasurement,
      floodMeasurementChange,
      floodMeasurementClear,
      floodClear,
      fire,
      fireChange,
      fireMeasurement,
      fireMeasurementChange,
      fireClear,
      fireMeasurementClear,
      points,
      pointsChange,
      videoUrls,
      videoUrlsChange,

      //新
      newflood,
      newfloodChange,
      newfire,
      newfireChange,
      newminePressure,
      newminePressureChange,
      newvideo,
      newvideoChange,
      newpeople,
      newpeopleChange,
      newbase,
      newbaseChange,
      newgas,
      newgasChange,
      peoplepointArr,
      peoplepointChange,
      peoplepointClear,
      sensor,
      sensorChange,
      rightShow,
      rightShowChange,
      rightShowClear,
      rightShow2,
      rightShowChange2,
      rightShowClear2,


      
      minRightShowData,
      minrightShowChange,
      minRightShowDataClear,
      fireRightShowData,
      firerightShowChange,
      fireRightShowDataClear,
      floodRightShowData,
      floodRightShowDataChange,
      floodRightShowDataClear,
      peopleRightShowData,
      peopleRightShowDataChange,
      peopleRightShowDataClear,
      baseRightShowData,
      baseRightShowDataChange,
      baseRightShowDataClear,
      baserightShow,
      baserightShowChange,
      baserightShowClear,

      sensorRightShowData,
      sensorRightShowDataChange,
      sensorRightShowDataClear,
      gasRightShowData,
      gasRightShowDataChange,
      gasRightShowDataClear,
      videoRightShowData,
      videoRightShowDataChange,
      videoRightShowDataClear

    }
  },
  {
    persist: false
  }
)
