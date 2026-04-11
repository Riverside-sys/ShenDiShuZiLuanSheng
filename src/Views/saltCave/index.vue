<template>
  <div class="viewer-container" ref="viewerContainerRef" v-show="!showSubscene">
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

    <!-- 模型点击标签 -->
    <div
      v-if="showLabel"
      class="model-label"
      :style="{ left: labelPos.x + 'px', top: labelPos.y + 'px' }"
    >
      <div class="label-content">
        <span class="label-title">盐穴单体</span>
        <button class="label-btn" @click="enterSubscene">进入盐穴场景</button>
      </div>
      <div class="label-arrow"></div>
    </div>

    <!-- UI 层容器，进行整体缩放 -->
    <div class="ui-layer" ref="uiLayer">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <WidgetPanel01 />
        <WidgetPanel02 />
        <WidgetPanel03 />
      </div>

      <!-- 顶部操作栏 -->
      <div class="top-action-bar">
        <button
          class="action-btn"
          :class="{ active: activeAction === 'patrol' }"
          @click="handlePatrol"
        >
          <span class="action-icon">&#x1f504;</span>
          <span>{{ isPatrolling ? '停止巡检' : '巡检' }}</span>
        </button>
        <button
          class="action-btn"
          :class="{ active: activeAction === 'caveA' }"
          @click="handleViewCaveA"
        >
          <span class="action-icon">A</span>
          <span>丰储1号腔</span>
        </button>
        <button
          class="action-btn"
          :class="{ active: activeAction === 'caveB' }"
          @click="handleViewCaveB"
        >
          <span class="action-icon">B</span>
          <span>通源5号腔</span>
        </button>
        <button class="action-btn" @click="handleOverview">
          <span class="action-icon">&#x1f3e0;</span>
          <span>总览</span>
        </button>
        <button class="action-btn debug" @click="logPose">
          <span>输出姿态</span>
        </button>
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

  <!-- 子场景容器 -->
  <div class="subscene-container" v-if="showSubscene">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import * as THREE from "three"
import { Tween, Group, Easing } from "@tweenjs/tween.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { saltCaveModelUrl } from "./data"

import Footer from "./components/Footer/index.vue"
import WidgetPanel01 from "./components/Charts/WidgetPanel01.vue"
import WidgetPanel02 from "./components/Charts/WidgetPanel02.vue"
import WidgetPanel03 from "./components/Charts/WidgetPanel03.vue"
import WidgetPanel04 from "./components/Charts/WidgetPanel04.vue"
import WidgetPanel05 from "./components/Charts/WidgetPanel05.vue"
import WidgetPanel06 from "./components/Charts/WidgetPanel06.vue"

const route = useRoute()
const router = useRouter()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const uiLayer = ref<HTMLElement | null>(null)
const viewerContainerRef = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const loadingMessage = ref("")

const showLabel = ref(false)
const labelPos = ref({ x: 0, y: 0 })

const showSubscene = computed(() => route.name !== 'saltCave')

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let animationId: number | null = null
let modelRoot: THREE.Object3D | null = null

const isPatrolling = ref(false)
const activeAction = ref<string | null>(null)
const tweenGroup = new Group()
let patrolAngle = 0
let patrolSpeed = 0.004
let patrolRadius = 0.8
let patrolHeight = 0.15
let patrolTargetY = -0.05

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const onCanvasClick = (event: MouseEvent) => {
  if (!camera || !modelRoot || !viewerContainerRef.value) return

  const rect = viewerContainerRef.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(modelRoot, true)

  if (intersects.length > 0) {
    labelPos.value = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    showLabel.value = true
  } else {
    showLabel.value = false
  }
}

const enterSubscene = () => {
  showLabel.value = false
  router.push("/saltCave/subscenes/salt_cave_single")
}

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
  renderer.outputColorSpace = THREE.SRGBColorSpace

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

  viewerContainerRef.value.addEventListener("click", onCanvasClick)

  animate()
}

const animate = (time?: number) => {
  animationId = requestAnimationFrame(animate)
  tweenGroup.update(time)
  if (isPatrolling.value && controls && camera) {
    patrolAngle += patrolSpeed
    const r = patrolRadius
    camera.position.set(
      Math.sin(patrolAngle) * r,
      patrolHeight,
      Math.cos(patrolAngle) * r
    )
    controls.target.set(0, patrolTargetY, 0)
  }
  if (controls) controls.update()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

const loadSaltCaveModel = async () => {
  if (!scene || !camera || !controls) return

  isLoading.value = true
  loadingMessage.value = "正在加载盐穴三维模型..."

  const loader = new GLTFLoader()

  try {
    const gltf = await loader.loadAsync(saltCaveModelUrl, (progress) => {
      if (progress.total > 0) {
        const pct = Math.round((progress.loaded / progress.total) * 100)
        loadingMessage.value = `正在加载盐穴三维模型... ${pct}%`
      }
    })

    const root = gltf.scene
    root.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    const box = new THREE.Box3().setFromObject(root)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z, 1)

    root.position.sub(center)
    scene.add(root)
    modelRoot = root

    const fitHeightDistance = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
    const fitWidthDistance = fitHeightDistance / Math.max(camera.aspect, 1)
    const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.15
    camera.near = Math.max(maxDim / 1000, 0.1)
    camera.far = Math.max(maxDim * 100, 100000)
    camera.updateProjectionMatrix()
    camera.position.set(distance * 0.9, distance * 0.35, distance * 0.9)
    controls.minDistance = Math.max(maxDim * 0.05, 0.5)
    controls.maxDistance = Math.max(maxDim * 20, distance * 10)
    controls.target.set(0, 0, 0)
    controls.update()

    initialCameraPos = camera.position.clone()
    initialControlsTarget = controls.target.clone()

    loadingMessage.value = "加载完成"
  } catch (err) {
    console.error("GLB模型加载失败:", err)
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

const logPose = () => {
  if (!camera || !controls) return
  const pose = {
    cameraPosition: {
      x: +camera.position.x.toFixed(4),
      y: +camera.position.y.toFixed(4),
      z: +camera.position.z.toFixed(4),
    },
    controlsTarget: {
      x: +controls.target.x.toFixed(4),
      y: +controls.target.y.toFixed(4),
      z: +controls.target.z.toFixed(4),
    },
  }
  console.log("========== 当前模型姿态 ==========")
  console.log(JSON.stringify(pose, null, 2))
  console.log("==================================")
}

const stopPatrol = () => {
  isPatrolling.value = false
}

type Vec3 = { x: number; y: number; z: number }

interface FlyWaypoint {
  camPos: Vec3
  ctrlTarget: Vec3
  duration?: number
}

const smoothFlyThrough = (waypoints: FlyWaypoint[]) => {
  if (!camera || !controls || waypoints.length === 0) return
  stopPatrol()
  tweenGroup.removeAll()
  controls.enabled = false

  let step = 0

  const runStep = () => {
    if (!camera || !controls) return
    const wp = waypoints[step]
    const dur = wp.duration ?? 1500

    const posObj = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
    const tgtObj = { x: controls.target.x, y: controls.target.y, z: controls.target.z }

    const posTween = new Tween(posObj)
      .to(wp.camPos, dur)
      .easing(Easing.Cubic.InOut)
      .onUpdate(() => {
        if (camera) camera.position.set(posObj.x, posObj.y, posObj.z)
      })
      .onComplete(() => {
        step++
        if (step < waypoints.length) {
          runStep()
        } else {
          if (controls) controls.enabled = true
        }
      })

    const targetTween = new Tween(tgtObj)
      .to(wp.ctrlTarget, dur)
      .easing(Easing.Cubic.InOut)
      .onUpdate(() => {
        if (controls) controls.target.set(tgtObj.x, tgtObj.y, tgtObj.z)
      })

    tweenGroup.add(posTween)
    tweenGroup.add(targetTween)
    posTween.start()
    targetTween.start()
  }

  runStep()
}

const handlePatrol = () => {
  if (isPatrolling.value) {
    stopPatrol()
    activeAction.value = null
    return
  }
  activeAction.value = "patrol"
  if (camera && controls) {
    const pos = camera.position
    patrolAngle = Math.atan2(pos.x, pos.z)
    patrolRadius = Math.sqrt(pos.x * pos.x + pos.z * pos.z) || 0.8
    patrolHeight = pos.y
    patrolTargetY = controls.target.y
  }
  isPatrolling.value = true
}

const handleViewCaveA = () => {
  activeAction.value = "caveA"
  smoothFlyThrough([
    {
      camPos: { x: -0.0647, y: 0.2576, z: 0.4977 },
      ctrlTarget: { x: -0.0765, y: -0.0021, z: -0.0035 },
      duration: 1200,
    },
    {
      camPos: { x: -0.0457, y: -0.0503, z: 0.584 },
      ctrlTarget: { x: 0.0074, y: -0.1064, z: 0.0148 },
      duration: 1200,
    },
  ])
}

const handleViewCaveB = () => {
  activeAction.value = "caveB"
  smoothFlyThrough([
    {
      camPos: { x: 0.1958, y: 0.2239, z: 0.4997 },
      ctrlTarget: { x: 0.1842, y: -0.032, z: 0.0059 },
      duration: 1200,
    },
    {
      camPos: { x: 0.2132, y: -0.0764, z: 0.5711 },
      ctrlTarget: { x: 0.2339, y: -0.1399, z: 0.0251 },
      duration: 1200,
    },
  ])
}

const handleOverview = () => {
  activeAction.value = null
  if (!initialCameraPos || !initialControlsTarget) return
  smoothFlyThrough([
    {
      camPos: { x: initialCameraPos.x, y: initialCameraPos.y, z: initialCameraPos.z },
      ctrlTarget: { x: initialControlsTarget.x, y: initialControlsTarget.y, z: initialControlsTarget.z },
      duration: 1500,
    },
  ])
}

watch(showSubscene, (val) => {
  if (!val) {
    setTimeout(() => handleResize(), 100)
  }
})

onMounted(() => {
  initThreeScene()
  loadSaltCaveModel()
  handleResize()
  window.addEventListener("resize", handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize)
  stopPatrol()
  tweenGroup.removeAll()

  if (viewerContainerRef.value) {
    viewerContainerRef.value.removeEventListener("click", onCanvasClick)
  }

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
  if (modelRoot) {
    modelRoot.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return

      child.geometry.dispose()

      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose())
      } else {
        child.material.dispose()
      }
    })
  }

  modelRoot = null
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

  .top-action-bar {
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    pointer-events: auto;
    display: flex;
    gap: 12px;
    padding: 8px 16px;
    background: rgba(0, 15, 40, 0.75);
    border: 1px solid rgba(23, 199, 254, 0.25);
    border-radius: 10px;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      background: rgba(23, 199, 254, 0.08);
      color: #b9cfff;
      border: 1px solid rgba(23, 199, 254, 0.2);
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
      transition: all 0.25s;
      letter-spacing: 0.5px;

      .action-icon {
        font-size: 14px;
        font-weight: 700;
        color: #17c7fe;
      }

      &:hover {
        background: rgba(23, 199, 254, 0.2);
        border-color: rgba(23, 199, 254, 0.5);
        color: #fff;
      }

      &.active {
        background: rgba(23, 199, 254, 0.25);
        border-color: rgba(23, 199, 254, 0.7);
        color: #17c7fe;
        box-shadow: 0 0 12px rgba(23, 199, 254, 0.2);
      }

      &.debug {
        background: rgba(255, 180, 0, 0.1);
        border-color: rgba(255, 180, 0, 0.3);
        color: #ffb400;

        &:hover {
          background: rgba(255, 180, 0, 0.25);
          border-color: rgba(255, 180, 0, 0.6);
        }
      }
    }
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

  .model-label {
    position: absolute;
    z-index: 50;
    transform: translate(-50%, -100%);
    pointer-events: auto;
    animation: labelFadeIn 0.25s ease-out;

    .label-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 18px;
      background: rgba(0, 20, 50, 0.85);
      border: 1px solid rgba(23, 199, 254, 0.5);
      border-radius: 8px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(23, 199, 254, 0.15);

      .label-title {
        font-size: 13px;
        color: #b9cfff;
        white-space: nowrap;
      }

      .label-btn {
        padding: 6px 16px;
        background: linear-gradient(135deg, rgba(23, 199, 254, 0.25), rgba(23, 199, 254, 0.1));
        color: #17c7fe;
        border: 1px solid rgba(23, 199, 254, 0.6);
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        white-space: nowrap;
        transition: all 0.2s;

        &:hover {
          background: linear-gradient(135deg, rgba(23, 199, 254, 0.45), rgba(23, 199, 254, 0.25));
          box-shadow: 0 0 12px rgba(23, 199, 254, 0.3);
        }
      }
    }

    .label-arrow {
      width: 0;
      height: 0;
      margin: 0 auto;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid rgba(23, 199, 254, 0.5);
    }
  }

  @keyframes labelFadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -90%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -100%);
    }
  }
}

.subscene-container {
  width: 100%;
  height: 100%;
}
</style>
