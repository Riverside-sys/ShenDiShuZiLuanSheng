<!-- Equipment management 设备管理 -->
<template>
    <div>
        <FirstTitle>井下人员</FirstTitle>
        <div class="index-list">
            <div class="item" v-for="item in indexList" :key="item.label">
                <div class="icon"></div>
                <div class="right">
                    <div class="label">{{ item.label }}</div>
                    <div class="count">
                        {{ item.count }}
                        <span>{{ item.unit }}</span>
                    </div>
                </div>
            </div>
        </div>
        <FirstTitle>井下设备运行状态</FirstTitle>
        <div class="all-count">
            设备总数：
            <span class="count">782</span>
            台 （正在运行： 563 台）
        </div>
        <PieChart />

        <FirstTitle>视频监控预览</FirstTitle>
        <div class="video">
            <video
                src="/video/573240324-1-16.mp4"
                type="video/mp4"
                autoplay
            ></video>
            <!-- <div class="video-placeholder">
                <div class="placeholder-text">视频监控画面</div>
            </div> -->
            <div class="text">煤矿输送带实时监控</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import LineChart from "./LineChart.vue";
import PieChart from "./PieChart.vue";

const indexList = [
    {
        label: "井下人员数量",
        count: "36",
        unit: "人",
    },
    {
        label: "入井人员数量",
        count: "51",
        unit: "人",
    },
    {
        label: "最后入井时间",
        count: "14:05",
        unit: "",
    },
    {
        label: "平均入井时间",
        count: "58",
        unit: "分钟",
    },
];
</script>

<style lang="scss" scoped>
.flex {
    display: flex;
    align-items: center;
}
.index-list {
    display: flex;
    flex-wrap: wrap;
    .item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50%;
        margin-bottom: 10px;
        padding: 10px 5px;
        .icon {
            width: 45px;
            height: 45px;
            margin-right: 10px;
            background: #7e5626;
            border-radius: 50%;
            padding: 5px;
            box-shadow: 0 0 10px #eea449;
        }
        .label {
            margin-bottom: 10px;
            font-weight: bold;
            background-image: -webkit-linear-gradient(bottom, #eea449, #e6e4b2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .count {
            font-family: "Arial", sans-serif;
            padding-bottom: 5px;
            span {
                font-family: "Arial", sans-serif;
                color: #aaa;
                font-size: 14px;
            }
            border-bottom: 1px solid #fff;
        }
    }
}

.all-count {
    text-align: center;
    margin-left: 20px;
    border-left: 5px solid #ffb459;
    margin-bottom: 10px;
    .count {
        font-size: 18px;
        font-family: "Arial", sans-serif;
        color: #ffb459;
    }
}
.video {
    margin: 10px 0;
    .text {
        margin: 10px 0;
        text-align: center;
        color: #fff;
    }
    .video-placeholder {
        width: 100%;
        height: 200px;
        background: #1e2938;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #333;
        .placeholder-text {
            color: #555;
            font-size: 18px;
        }
    }
}
</style>
