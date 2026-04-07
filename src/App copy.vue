<template>
    <div id="app-container">
        <Header />
        <div class="main-content">
            <router-view />
        </div>
    </div>
</template>

<script lang="ts" setup>
import Header from "./components/header/index.vue";
</script>

<style lang="scss">
html,
body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

#app {
    width: 100%;
    height: 100%;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* background-color: #1a1a2e; */
    color: #fff;
}

#app-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

}

.main-content {
    flex: 1;
    position: relative;
    width: 100%;
}

// cesium全局部件样式
.cesium-widget {
    width: 100%;
    height: 100%;
}

// Remove Cesium credit container
.cesium-widget-credits {
    display: none !important;
}
</style>
