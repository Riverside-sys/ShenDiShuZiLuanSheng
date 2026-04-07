<!--
 * @Author: your name
 * @Date: 2022-04-01 20:58:53
 * @LastEditTime: 2022-05-30 10:42:23
 * @LastEditors: 张祥 17839092765@163.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \DTSWEEKLY_ZHGK\src\components\tools\weather.vue
-->
<!-- weather -->
<template>
    <div class="weather">
        <a-divider orientation="left" style="border-color: #ddd; color: #fff" dashed> 天气</a-divider>
        <div class="weathertype">
            <div @click="WeatherClick(item)" class="type" v-for="item in WeatherType" :key="item.name">
                <img :src="item.icon" alt="" />
                {{ item.name }}
            </div>
        </div>
        <a-divider orientation="left" style="border-color: #ddd; color: #fff" dashed>时间</a-divider>
        <div class="weathertype">
            <div class="type" @click="TimeTypeClick(item)" v-for="item in TimeType" :key="item.name">
                <img :src="item.icon" alt="" />
                {{ item.name }}
            </div>
            <!-- 开启或者关闭黑暗模式 -->
        </div>
        <div class="open-dark">
            <el-switch v-model="isDark" @change="changeDarkMode" class="ml-2" style="--el-switch-on-color: #0c0c0c; --el-switch-off-color: #ccc" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useAirCityStore } from '@/stores/aircity'
import { useToolsStore } from '@/stores/tools'

import { onMounted, onUnmounted, ref } from 'vue'
import { toTree } from './layerTree'
const AirCityStore: any = useAirCityStore()
const ToolsStore: any = useToolsStore()
const isHideFlag = ref(false)

const isDark = ref(false)
const shuaxin = async () => {
    const res: any = await __g.infoTree.get()
    await AirCityStore.SetTreeInfo(res.infotree)
    await ToolsStore.Setinfotree(toTree(res.infotree))
}
const HuanjingId = ref()

//
const WeatherType = ref([
    {
        name: '晴天',
        icon: require('./img/晴天.png')
    },
    {
        name: '多云',
        icon: require('./img/多云.png')
    },
    {
        name: '下雨',
        icon: require('./img/下雨.png')
    },
    {
        name: '下雪',
        icon: require('./img/下雪.png')
    }
])
const WeatherClick = (val: any) => {
    switch (val.name) {
        case '晴天':
            // 禁用雨雪效果;
            __g.weather.disableRainSnow()
            __g.weather.setCloudDensity(0.1)

            break
        case '多云':
            // 禁用雨雪效果;
            __g.weather.disableRainSnow()
            //  设置云层密度
            __g.weather.setCloudDensity(1)
            //  设置云层厚度
            __g.weather.setCloudThickness(2)
            //  云层高度单位：公里
            __g.weather.setCloudHeight(2)

            break
        case '下雨':
            //设置云层厚度
            __g.weather.setCloudThickness(2)
            //设置完云层厚度后才能开启雨效
            __g.weather.setRainParam(1, 1, 0.5)

            break
        case '下雪':
            //设置云层厚度
            __g.weather.setCloudThickness(2)
            //设置完云层厚度后才能开启雪效
            __g.weather.setSnowParam(1, 1, 0.5)

            break

        default:
            break
    }
}
/**
 * 开启/关闭黑暗模式
 * @param val
 */
const changeDarkMode = (val: boolean) => {
    __g.weather.setDarkMode(val)
}
const TimeType = ref([
    {
        name: '早晨',
        icon: require('./img/早晨.png')
    },
    {
        name: '中午',
        icon: require('./img/中午.png')
    },
    {
        name: '傍晚',
        icon: require('./img/傍晚.png')
    },
    {
        name: '夜晚',
        icon: require('./img/夜晚.png')
    }
])
const TimeTypeClick = (val: any) => {
    switch (val.name) {
        case '早晨':
            __g.weather.setDateTime(2022, 4, 2, 8, 8, false)
            break
        case '中午':
            __g.weather.setDateTime(2022, 4, 2, 14, 8, false)

            break
        case '傍晚':
            __g.weather.setDateTime(2022, 4, 2, 18, 8, false)

            break
        case '夜晚':
            __g.weather.setDateTime(2022, 4, 2, 24, 8, false)

            break

        default:
            break
    }
}
onMounted(() => {
    AirCityStore.$state.TreeInfo.forEach((item: any) => {
        if (item.name === '环境') {
            HuanjingId.value = item.iD
        }
    })
})
onUnmounted(() => {
    // __g.infoTree.show(HuanjingId.value);
    isHideFlag.value = false
    // __g.weather.setAmbientLightIntensity(0);
    // 刷新图层树仓库
    shuaxin()
})
</script>
<style lang="scss" scoped>
.weather {
    position: absolute;
    @include Width(300);
    @include hHeight(300);
    @include Top(130);
    @include Right(200);
    @include Padding(10, 10, 10, 10);
    border-radius: 2%;
    margin: auto;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 10;
    background: rgb(28, 39, 52);
    .tip {
        @include FontSize(12);
        .colsehuanjing {
            @include Padding(3.5, 2, 5, 2);

            cursor: pointer;
            &:hover {
                color: aqua;
            }
        }
        // color: aqua;
    }
    .weathertype {
        width: 100%;
        @include hHeight(50);
        display: flex;
        justify-content: space-around;
        align-items: center;
        .type {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            @include Padding(10, 15, 10, 15);
            cursor: pointer;
            img {
                display: inline-block;

                @include MarginBottom(7);
                @include Width(20);
            }
            &:hover {
                background: rgba(0, 0, 0, 0.24);
            }
        }
    }

    .open-dark {
        margin-top: 16px;
        margin-left: 30px;
    }
}
</style>
