<!-- Equipment management 设备管理 -->
<template>
    <div>
        <FirstTitle>人员分布</FirstTitle>
        <BarChart />

        <FirstTitle>车辆进出统计</FirstTitle>
        <PieChart />

        <FirstTitle>告警信息</FirstTitle>
        <div class="info-list">
            <div class="item" v-for="(item, index) in infoList" :key="index">
                <span class="index">{{ index + 1 }}</span>
                <span class="info" :style="'color:' + item.color">{{
                    item.info
                    }}</span>
                <span class="date">{{ item.date }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import LineChart from "./LineChart.vue";
import PieChart from "./PieChart.vue";
import BarChart from "./BarChart.vue";

const infoList = [
    {
        date: "25-7-10",
        info: "西区可疑人员出入",
        color: "#ffffff",
    },
    {
        date: "25-7-10",
        info: "西区违规时间内入井",
        color: "#ffff00",
    },
    {
        date: "25-7-10",
        info: "北区可疑人员出入",
        color: "#ffffff",
    },
    {
        date: "25-7-10",
        info: "东区可疑人员出入",
        color: "#ffffff",
    },
    {
        date: "25-7-10",
        info: "东区较大煤与瓦斯突出事故",
        color: "#ffaaaa",
    },
    {
        date: "25-7-10",
        info: "南区可疑人员出入",
        color: "#ffffff",
    },
    {
        date: "25-7-7",
        info: "北区违规时间内入井",
        color: "#ffff00",
    },
    {
        date: "25-7-7",
        info: "南区可疑人员出入",
        color: "#ffffff",
    },
    {
        date: "25-7-7",
        info: "北区违规时间内入井",
        color: "#ffff00",
    },
    {
        date: "25-7-7",
        info: "北区井下起火",
        color: "#ffaaaa",
    },
    {
        date: "25-7-7",
        info: "西区发生电子围栏闯入事件",
        color: "#ffff00",
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

            img {
                width: 35px;
                height: 35px;
            }
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

.info-list {
    max-height: calc(50vh - 210px);
    overflow: hidden;

    &::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg,
                #feffdd 0%,
                #948a2d 100%) !important;
        border-radius: 4px;
    }

    overflow-y: scroll;

    .item {
        display: flex;
        justify-content: space-around;
        margin-bottom: 5px;
        font-size: 14px;
        padding-top: 6px;
        padding-bottom: 6px;
        background: linear-gradient(to right,
                rgba(209, 134, 72, 0.3),
                rgba(255, 252, 83, 0.1));
        border: 1px solid rgb(155, 98, 52);
        border-radius: 5px;

        .index {
            width: 25px;
            background: rgb(155, 122, 52);
            padding: 2px 4px;
            border-radius: 4px;
            text-align: center;
        }

        .info {
            width: 200px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .date {
            color: #ddd;
        }
    }
}
</style>
