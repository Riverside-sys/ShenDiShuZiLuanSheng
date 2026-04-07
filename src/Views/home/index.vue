<template>
    <div class="home-container">
        <div class="welcome-message">
            <h1>欢迎来到深地数字孪生平台</h1>
            <p>正在自动跳转到地面场景页面...</p>
            <div class="loading-spinner"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
    // 自动跳转到 surface 页面
    console.log("Home page loaded, redirecting to surface...");
    setTimeout(() => {
        router.replace("/surface");
    }, 1500); // 1.5秒后跳转，给用户看到欢迎信息的时间
});
</script>

<style lang="scss" scoped>
.home-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: #fff;
}

.welcome-message {
    text-align: center;
    padding: 2rem;
    background: rgba(0, 216, 255, 0.1);
    border-radius: 12px;
    border: 1px solid #00d8ff;
    box-shadow: 0 0 20px rgba(0, 216, 255, 0.3);
    max-width: 500px;

    h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        background: linear-gradient(135deg, #00d8ff, #0088ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    p {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        color: #e0e0e0;
    }
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 216, 255, 0.3);
    border-left: 4px solid #00d8ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
