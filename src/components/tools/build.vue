<!--
 * @Author: your name
 * @Date: 2022-04-07 17:44:17
 * @LastEditTime: 2022-05-30 10:42:26
 * @LastEditors: 张祥 17839092765@163.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \20220321_CGSY_FREEDO_DTSWEEKLY_ZHCG\src\components\tools\build.vue
-->
<!-- 楼宇拆解 -->
<template>
  <div class="build">
    <div v-if="buildClass" class="top">
      <div
        :style="{ color: buildClass.IsOpen ? 'aquamarine' : '#fff' }"
        @click="Open"
        class="open"
      >
        开启
      </div>
      <div
        v-if="buildClass && buildClass.IsOpen"
        :style="{ color: !buildClass.IsOpen ? 'aquamarine' : '#fff' }"
        @click="Close"
        class="close"
      >
        关闭
      </div>
    </div>
    <div
      v-if="buildClass"
      :style="{ opacity: buildClass.IsOpen ? 1 : 0.5 }"
      class="bottom"
    >
      <div
        :style="{ color: Foolr === item.foolr ? 'aquamarine' : '#fff' }"
        @click="Clickfoolr(item.foolr, true)"
        v-for="(item, index) in FoolrList"
        :key="index"
        :class="Foolr === item.foolr ? 'isactive' : ''"
      >
        <span>
          {{ item.name }}
        </span>
        <span> F </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAirCityStore } from "@/stores/aircity";
import { useToolsStore } from "@/stores/tools";
import { BuildByTiler } from "@/utils/buildByTiler";
import { AddPolyline } from "@/Views/home/EmergencyManagement/Add3d";
import { Fn2_AddPolyon } from "@/Views/home/IntelligentSecurity/tools/myfn";
import { computed, onMounted, ref } from "vue";
const buildClass = ref(new BuildByTiler());
const Foolr = ref(0);
const AirCityStore = useAirCityStore();
const NowLocal = computed(() => AirCityStore.$state.nowLocal);
const ToolsStore = useToolsStore();
const FoolrList = ref([
  {
    name: "1",
    foolr: 1,
  },
  {
    name: "2",
    foolr: 2,
  },
  {
    name: "3",
    foolr: 3,
  },
  {
    name: "4",
    foolr: 4,
  },
]);
onMounted(() => {
  buildClass.value.init(["L01", "1L", "2L", "3L"].reverse());
  ToolsStore.SetBuildinfo(buildClass.value);
  //   Infotree.value.forEach((Litem: any) => {
  //     if (item.name === "照明灯光") {
  //       LightId.value = item.iD;
  //     }
  //     if (item.name === "照明") {
  //       zhaomingId.value = item.iD;
  //     }
  //     if (item.name === "粒子特效") {
  //       LiZiId.value = item.iD;
  //     }
  //   });
});
const Open = async () => {
  //   __g.infoTree.hide(LightId.value);
  //   __g.infoTree.hide(LiZiId.value);
  //   __g.infoTree.hide(zhaomingId.value);

  //   console.log(Props.isshow);

  //   BuildByTiler("open");
  //   Props.isshow(false);
  //   await __g.camera.set(
  //     375.506409,
  //     -590.457825,
  //     516.756592,
  //     -13.833544,
  //     -67.236168,
  //     0.5
  //   );
  buildClass.value.open();
  //   setTimeout(() => {
  //   }, 1000);
};
const Close = () => {
  Foolr.value = 0;
  buildClass.value.close();
  Fn2_AddPolyon(0, false);
  AddPolyline(false);
};
const Clickfoolr = (val: number, bol: boolean) => {
  //   AddCtag_BuildFoolr(1, false);

  if (buildClass.value.IsOpen) {
    if (NowLocal.value === "会议系统") {
      Meeting(val, bol);
    } else {
      Foolr.value = val;

      buildClass.value.clickfoolr(val, bol);
    }
  }
};
// 当在会议系统模块是触发的事件
const Meeting = async (val: number, bol: boolean) => {
  Foolr.value = val;
  await Fn2_AddPolyon(0, false);

  switch (val) {
    case 1:
      __g.camera.set(
        379.187578,
        969.707109,
        154.934023,
        -33.160603,
        -0.255829,
        0.5
      );
      //   AddCtag_BuildFoolr(1, true);
      break;
    case 2:
      __g.camera.set(
        360.005,
        971.760742,
        213.497227,
        -40.069901,
        -0.255829,
        0.5
      );
      //   AddCtag_BuildFoolr(2, true);

      break;
    case 3:
      __g.camera.set(
        533.105703,
        1066.971367,
        145.344355,
        -28.282187,
        50.191948,
        0.5
      );

      Fn2_AddPolyon(3, true);
      break;
    case 4:
      __g.camera.set(
        138.906016,
        885.806094,
        378.972461,
        -29.268732,
        -8.080216,
        0.5
      );
      break;

    default:
      break;
  }
  buildClass.value.clickfoolr(val, bol);
};
</script>
<style lang="scss" scoped>
.build {
  @include Width(70);
  // @include hHeight(400);
  @include BorderRadius(8);
  @include FontSize(14);
  background: linear-gradient(
    360deg,
    rgba(14, 26, 42, 0.4) 0%,
    rgba(14, 26, 42, 0.8) 100%
  );
  z-index: 10;
  border: 1px solid rgba(122, 250, 254, 0.562);
  position: absolute;
  @include Top(150);
  @include Left(480);
  transform: translateX(0) !important;
  .top {
    @include Width(50);
    margin: 0 auto;
    > div {
      @include Width(50);
      @include hHeight(50);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }
  .bottom {
    @include Width(50);
    margin: 0 auto;
    @include BorderTop(1, solid, rgba(255, 255, 255, 0.76));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 1.5s;
    > div {
      @include Width(50);
      @include hHeight(50);
      @include MarginTop(10);
      @include MarginBottom(10);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: url("./img/flat_icon_normal_bg@2x.png") no-repeat center/cover;
      background-size: 100% 100%;
      //   color: aquamarine;
      &.isactive {
        background: url("./img/flat_icon_click_bg@2x.png") no-repeat
          center/cover;
        background-size: 100% 100%;
      }
    }
  }
}
</style>
