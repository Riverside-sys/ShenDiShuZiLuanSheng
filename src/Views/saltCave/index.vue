<template>
  <div class="viewer-container" ref="viewerContainerRef">
    <!-- Three.js 三维场景容器 -->
    <div class="center">
      <div class="three-view">
        <canvas ref="canvasRef" class="three-canvas"></canvas>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- UI 层容器，进行整体缩放 -->
    <div class="ui-layer" ref="uiLayer">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <WidgetPanel01 />
        <WidgetPanel02 />
        <WidgetPanel03 />
      </div>

      <!-- 功能按钮（占位） -->
      <div class="toolbar-container">
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <WidgetPanel04 />
        <WidgetPanel05 />
        <WidgetPanel06 />
      </div>

      <!-- 底部工具栏 -->
      <div class="bottom-panel">
        <Footer @resetView="handleResetView" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import * as THREE from "three"
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { saltCaveModelUrl } from "./data"

import Footer from "./components/Footer/index.vue"
import WidgetPanel01 from "./components/Charts/WidgetPanel01.vue"
import WidgetPanel02 from "./components/Charts/WidgetPanel02.vue"
import WidgetPanel03 from "./components/Charts/WidgetPanel03.vue"
import WidgetPanel04 from "./components/Charts/WidgetPanel04.vue"
import WidgetPanel05 from "./components/Charts/WidgetPanel05.vue"
import WidgetPanel06 from "./components/Charts/WidgetPanel06.vue"

const canvasRef = ref<HTMLCanvasElement | null>(null)
const uiLayer = ref<HTMLElement | null>(null)
const viewerContainerRef = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const loadingMessage = ref("")

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let animationId: number | null = null

const initThreeScene = () => {
  if (!canvasRef.value || !viewerContainerRef.value) return

  const width = viewerContainerRef.value.clientWidth
  const height = viewerContainerRef.value.clientHeight

  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100000)
  camera.position.set(0, 500, 800)
  camera.lookAt(0, 0, 0)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = true
  controls.minDistance = 10
  controls.maxDistance = 50000

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(500, 1000, 500)
  scene.add(directionalLight)

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
  directionalLight2.position.set(-500, -500, -500)
  scene.add(directionalLight2)

  animate()
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

const loadPLYModel = async () => {
  if (!scene || !camera || !controls) return

  isLoading.value = true
  loadingMessage.value = "正在加载盐穴三维模型..."

  const loader = new PLYLoader()

  try {
    const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
      loader.load(
        saltCaveModelUrl,
        (geo) => resolve(geo),
        (progress) => {
          if (progress.total > 0) {
            const pct = Math.round((progress.loaded / progress.total) * 100)
            loadingMessage.value = `正在加载盐穴三维模型... ${pct}%`
          }
        },
        (err) => reject(err)
      )
    })

    geometry.computeVertexNormals()

    let material: THREE.Material
    if (geometry.hasAttribute("color")) {
      material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        shininess: 30,
      })
    } else {
      material = new THREE.MeshPhongMaterial({
        color: 0x3399ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        shininess: 30,
      })
    }

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox!
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    const size = new THREE.Vector3()
    bbox.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z)
    const fitDistance = maxDim * 1.5

    controls.target.copy(center)
    camera.position.set(
      center.x + fitDistance * 0.5,
      center.y + fitDistance * 0.8,
      center.z + fitDistance * 0.5
    )
    camera.lookAt(center)
    controls.update()

    initialCameraPos = camera.position.clone()
    initialControlsTarget = controls.target.clone()

    loadingMessage.value = "加载完成"
  } catch (err) {
    console.error("PLY模型加载失败:", err)
    loadingMessage.value = "模型加载失败"
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  }
}

const handleResize = () => {
  if (!viewerContainerRef.value || !renderer || !camera) return

  const width = viewerContainerRef.value.clientWidth
  const height = viewerContainerRef.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)

  if (uiLayer.value) {
    uiLayer.value.style.transform = `scale(${width / 1920}, ${height / 1080})`
  }
}

let initialCameraPos: THREE.Vector3 | null = null
let initialControlsTarget: THREE.Vector3 | null = null

const handleResetView = () => {
  if (!camera || !controls || !initialCameraPos || !initialControlsTarget) return
  camera.position.copy(initialCameraPos)
  controls.target.copy(initialControlsTarget)
  controls.update()
}

onMounted(() => {
  initThreeScene()
  loadPLYModel()
  handleResize()
  window.addEventListener("resize", handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize)

  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  if (controls) {
    controls.dispose()
    controls = null
  }

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  scene = null
  camera = null
})
</script>

<style scoped lang="scss">
.viewer-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: url(@/assets/dianchang/page_bg.png) no-repeat center center;
  background-size: cover;

  .center {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;

    .three-view {
      width: 100%;
      height: 100%;

      .three-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;

    .loading-content {
      text-align: center;
      color: #fff;
      padding: 2rem;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(23, 199, 254, 0.3);

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.2);
        border-top: 3px solid #17c7fe;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      p {
        font-size: 14px;
        color: #b9cfff;
      }
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .ui-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px;
    transform-origin: left top;
    z-index: 10;
    pointer-events: none;
    overflow: hidden;
  }

  .left-panel,
  .right-panel,
  .bottom-panel {
    position: absolute;
    pointer-events: none;
  }

  .left-panel {
    top: 20px;
    left: 0;
    width: 474px;
    display: flex;
    flex-direction: column;
    grid-gap: 30px;
    height: 100%;
    padding-top: 20px;
    padding-left: 20px;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.6), transparent);
    color: #fff;
  }

  .toolbar-container {
    position: absolute;
    left: 480px;
    top: 40px;
    z-index: 20;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .right-panel {
    top: 20px;
    right: 0;
    width: 474px;
    display: flex;
    flex-direction: column;
    grid-gap: 30px;
    height: 100%;
    padding-top: 20px;
    padding-right: 20px;
    text-align: right;
    background: linear-gradient(to left, rgba(0, 0, 0, 0.6), transparent);
    color: #fff;
  }

  .bottom-panel {
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    pointer-events: none;
    z-index: 20;
  }
}
</style>
