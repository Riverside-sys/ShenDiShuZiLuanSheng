<!-- 加载视频流组件 -->
<template>
    <div>
        <div id="player"></div>
        <transition appear name="custom-classes-transition" enter-active-class="animate__animated animate__faster  animate__fadeIn " leave-active-class="animate__animated animate__fast animate__fadeOut ">
            <div id="appLoading" v-show="loading">
                <div id="loading-wrapper">
                    <div class="loading-gif"></div>
                    <div id="loading-text">{{ loadingText }}</div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { getWebSocketUrl, ManageCommand } from './connect'
import { onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import OnReady from '@/components/aircityutils/onReady'
import OnEvent from '@/components/aircityutils/Event'
import { useAirCityStore } from '@/stores/aircity'
import { useToolsStore } from '@/stores/tools'
import { useDialogStore } from '@/stores/dialog'

const AirCitystore = useAirCityStore()
let aircityApi = ref()
let aircityPlayer = ref()
const loadingText = ref('系统正在加载......')
const loading = ref(true)
const reTimer = ref()
const tools = useToolsStore()
const useDialog = useDialogStore()
const initInterface = (iscloud: boolean) => {
    let log = () => {}
    //onReady
    let _onReady = () => {
        OnReady()
        loading.value = false
    }
    //onEvent
    let _onEvent = (e: any) => {
        OnEvent(e)
    }

    let _onClose = (e: any) => {
        //如果没有指定工程文件，则加上pid参数，pid=-1让服务器随便指定一个工程文件
        //如果想访问指定的工程文件，则明确指定pid, 例如pid=3
        if (e && e.code == 4009) {
            if (location.href.indexOf('?') == -1) location.href += '?pid=-1'
            else location.href += '&pid=-1'
        }
        const code_need_reconcent = [1006, 1008, 1013, 4e3, 4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4100, 4101, 4102, 4103, 4105, 4107]
        if (e && code_need_reconcent.includes(e.code)) {
            loading.value = true
            loadingText.value = e.reason || '连接已断开，正在重新连接......'
            AirCitystore.SetIsOnReady(false)
            reTimer.value && clearInterval(reTimer.value)
            let i = 5
            reTimer.value = setInterval(() => {
                loadingText.value = `${e.reason},${i}s后重新连接` || `连接已断开,${i}s后重新连接`
                if (i == 0) {
                    reTimer.value && clearInterval(reTimer.value)
                    loadingText.value = `系统正在加载......`

                    reConnect()
                }
                i--
            }, 1000)
        } else {
            loadingText.value = `${e.reason}`
        }
    }
    // _onApiVersion
    let _onApiVersion = (e: any) => {}
    // onloaded
    let _onloaded = () => {
        onResize()
    }
    //AirCityAPI初始化选项
    let apiOptions = {
        onReady: _onReady,
        onApiVersion: _onApiVersion,
        onEvent: _onEvent,
        onLog: log,
        useColorLog: false //仅用于SDK测试页面，二次开发请设置为false
    }
    //2021.07.30 因为支持了端口映射，所以这个地方要处理一下内外网host的问题
    //因为HostConfig里自动生成的是内网地址，所以这个地方要根据当前访问的地址替换一下
    // if (location.protocol != "file:") {
    //   HostConfig.Player =
    //     location.hostname + ":" + HostConfig.Player.split(":")[1];
    // }
    //Cloud需要同时初始化AirCityAPI和AirCityPlayer
    if (iscloud) {
        //AirCityPlayer
        let options
        if (document.getElementById('player')) {
            //需要显示视频流
            options = {
                iid: Common_config.iid,
                pid: null,
                domId: 'player',
                apiOptions: apiOptions,
                keyEventReceiver: 'video', //三维键盘交互事件接收者，可选的值：document / video / none
                ui: {
                    startupInfo: true, //默认值为true，初始化过程中是否显示详细信息（如果不需要，直接去掉此属性即可）
                    statusIndicator: true, //默认值为true，左上角闪烁的状态指示灯，可以从不同的颜色看出当前的状态
                    statusButton: false, //默认值为false，是否在左下角显示信息按钮（如果不需要，直接去掉此属性即可）
                    fullscreenButton: false, //默认值为false，是否在右下角显示全屏按钮（如果不需要，直接去掉此属性即可）
                    homeButton: false, //默认值为false，是否在左下角显示“回到初始位置”按钮（如果不需要，直接去掉此属性即可）
                    taskListBar: 1 //默认值为1，是否在下方显示“任务队列（API调用队列）”信息（0: 永不显示；1: 执行比较耗时的操作时显示；2: 一直显示）
                },
                onclose: _onClose,
                onloaded: _onloaded
            }
        } else {
            options = {
                pid: null,
                apiOptions: apiOptions
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;(options as any).actionEventHander = {
            onmousedown: (e: any) => {
                if (e.buttons === 1) {
                    useDialog.setXY([e.x, e.y])
                }
            }
        }
        const Ip = HostConfig.Manager ? HostConfig.Manager : HostConfig.Player
        aircityPlayer.value = new AirCityPlayer(Ip, options)
        AirCitystore.SetAirCityPlayer(aircityPlayer.value)
        aircityApi.value = aircityPlayer.value.getAPI()
        AirCitystore.SetAirCityApi(aircityApi.value)

        let res = document.getElementById('player') || null
        let pre = res ? res.getElementsByTagName('pre') : null
        let i = res ? res.getElementsByTagName('i') : null
        if (pre) {
            pre[0].style.left = '47%'
            pre[0].style.top = '15%'
        }
        if (i) {
            i[0].style.left = '47%'
            i[0].style.top = '14%'
        }
    }
}
const onResize = () => {
    aircityPlayer.value.ui_onResize && aircityPlayer.value.ui_onResize()
    aircityPlayer.value.resize && aircityPlayer.value.resize()
}
const beforeunloadHandler = () => {
    // aircityApi.value.reset();
}
const mousedown = (e: any) => {
    // console.log(e, "mousedownmousedown");
}
const wheel = (e: any) => {
    // console.log(e, "wheelwheel");
}
const reConnect = () => {
    initInterface(true)
}
onMounted(async () => {
    initInterface(true)
})

onUnmounted(() => {
    aircityPlayer.value && aircityPlayer.value.destroy()
    aircityApi.value && aircityApi.value.destroy()
    window.removeEventListener('resize', onResize)
    window.removeEventListener('beforeunload', beforeunloadHandler)
})
</script>
<style lang="scss" scoped>
#player {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;

    .loading {
        @include Width(50);
        @include hHeight(50);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        @include FontSize(40);
        font-weight: 600;

        :deep(.el-loading-mask) {
            background: rgba(0, 0, 0, 0) !important;

            .circular {
                @include Width(50);
                @include hHeight(50);

                .path {
                    stroke: rgb(32, 158, 216);
                }
            }
        }
    }
}

#appLoading {
    width: 100%;
    height: 100%;
    background: #000;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    z-index: 1110;
    opacity: 0.5;
    display: none;

    #loading-wrapper {
        position: relative;
        @include Width(800);
        @include wHeight(190);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .loading-gif {
            background: url('~@/assets/images/loading/loading.gif') no-repeat;
            @include Width(800);
            @include wHeight(160);
            background-size: 100% 100%;
        }

        #loading-text {
            position: absolute;
            @include Top(160);
            z-index: 111111;
            @include Width(800);
            @include wHeight(30);
            @include LineHeight(30);
            text-align: center;
            @include FontSize(12);
            color: #50a7d0;
            font-family: Tencent, serif;
        }
    }
}
</style>
