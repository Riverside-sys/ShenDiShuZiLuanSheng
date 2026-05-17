<template>
  <div class="salt-cave-single-viewer" ref="viewerRef">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Three.js 容器 -->
    <canvas ref="canvasRef" class="viewer-canvas"></canvas>

    <!-- UI 层 -->
    <div class="ui-layer" ref="uiLayer">
      <!-- 顶部标题 -->
      <div class="top-bar">
        <div class="brand">
          <span class="brand-tag">盐穴单体</span>
          <span class="brand-sub">数字孪生 · 储能分析</span>
        </div>
        <div class="brand-stats">
          <div class="stat">
            <div class="stat-label">当前盐穴</div>
            <div class="stat-value">{{ activeCaveName }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">运行状态</div>
            <div class="stat-value mode">正常</div>
          </div>
        </div>
      </div>

      <!-- 左侧面板 -->
      <div class="left-panel">
        <CaveDetailPanel
          :cave-data="caveData"
          :active-id="activeCaveId"
          @select="handleSelectCave"
        />
        <CaveMonitorPanel />
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <CaveVolumePanel />
        <CaveCreepPanel />
        <CaveStabilityPanel />
      </div>

      <!-- 底部控制栏 -->
      <div class="bottom-bar">
        <div class="bottom-controls">
          <button class="ctrl-btn" @click="dismissAndGoBack">返回盐穴场景</button>
          <button class="ctrl-btn" @click="dismissAndResetView">重置视角</button>
          <button
            class="ctrl-btn"
            :class="isMultipleModel ? 'overview-btn' : 'link-btn'"
            :disabled="isFlying || isSwitchingModel"
            @click="dismissAndToggleModel"
          >
            {{ isMultipleModel ? '查看盐穴整体分布' : '查看盐穴链接关系状态' }}
          </button>
        </div>
      </div>

      <!-- 控制面板 - 左上角 -->
      <div class="controls">
        <div class="cave-dropdown" v-if="!isMultipleModel">
          <button class="btn cave-select-btn" @click="toggleDropdown" :disabled="isFlying">
            {{ selectedCaveLabel }}
            <span class="arrow" :class="{ open: dropdownOpen }">&#9662;</span>
          </button>
          <div v-if="dropdownOpen" class="dropdown-menu">
            <div
              v-for="cave in caveList"
              :key="cave.id"
              class="dropdown-item"
              :class="{ active: activeCave?.name === cave.name }"
              @click="selectCave(cave.id)"
            >
              {{ cave.name }}
            </div>
          </div>
        </div>
        <button @click="logPose" class="btn debug-btn">输出当前姿态</button>
      </div>

      <!-- 切换到关联视角后的弹出标签 -->
      <div v-if="showMultipleLabel" class="multiple-label">
        <div class="label-content">
          <span class="label-title">盐穴群关联状态</span>
          <button class="label-btn" @click="switchToMultipleModel">
            {{ isSwitchingModel ? '加载中...' : '查看盐穴关联模型' }}
          </button>
        </div>
        <div class="label-arrow"></div>
      </div>

      <!-- 盐穴信息面板 -->
      <div v-if="activeCave" class="cave-info-panel" :key="activeCave.name">
        <div class="panel-header">
          <span class="panel-title">{{ activeCave.name }}</span>
          <button class="panel-close" @click="dismissCavePanel">&times;</button>
        </div>
        <div class="panel-body">
          <div class="info-row" v-for="item in activeCave.info" :key="item.label">
            <span class="info-label">{{ item.label }}</span>
            <span class="info-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue"
import { useRouter } from "vue-router"
import * as THREE from "three"
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { saltCaveSingleUrl, saltCaveMultipleUrl } from "../data"
import CaveDetailPanel from "../components/Charts/SaltCave/CaveDetailPanel.vue"
import CaveMonitorPanel from "../components/Charts/SaltCave/CaveMonitorPanel.vue"
import CaveVolumePanel from "../components/Charts/SaltCave/CaveVolumePanel.vue"
import CaveCreepPanel from "../components/Charts/SaltCave/CaveCreepPanel.vue"
import CaveStabilityPanel from "../components/Charts/SaltCave/CaveStabilityPanel.vue"

const router = useRouter()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isLoading = ref(false)
const loadingMessage = ref("")
const showMultipleLabel = ref(false)
const isFlying = ref(false)
const isSwitchingModel = ref(false)
const isMultipleModel = ref(false)
const dropdownOpen = ref(false)
const activeCave = ref<typeof caveList[number] | null>(null)

interface CaveInfo {
  label: string
  value: string
}

interface CaveItem {
  id: string
  name: string
  cameraPosition: { x: number; y: number; z: number }
  controlsTarget: { x: number; y: number; z: number }
  info: CaveInfo[]
}

const caveList: CaveItem[] = [
  {
    id: 'A',
    name: '丰储 1 号腔',
    cameraPosition: { x: -547.1186, y: -23.3549, z: 321.4745 },
    controlsTarget: { x: -547.0741, y: -11.1035, z: 318.3555 },
    info: [
      { label: '深度', value: '1080 m' },
      { label: '单腔容积', value: '12.6 万 m³' },
      { label: '岩盐密度', value: '2.18 g/cm³' },
      { label: '抗压强度', value: '28.5 MPa' },
      { label: '承压能力', value: '18.2 MPa' },
      { label: '蠕变速率', value: '0.032 %/年' },
    ],
  },
  {
    id: 'B',
    name: '瑞盐 3 号腔',
    cameraPosition: { x: 684.7633, y: -672.5604, z: 177.4333 },
    controlsTarget: { x: 682.1671, y: -81.3015, z: 13.7507 },
    info: [
      { label: '深度', value: '1240 m' },
      { label: '单腔容积', value: '8.3 万 m³' },
      { label: '岩盐密度', value: '2.22 g/cm³' },
      { label: '抗压强度', value: '31.7 MPa' },
      { label: '承压能力', value: '21.5 MPa' },
      { label: '蠕变速率', value: '0.025 %/年' },
    ],
  },
  {
    id: 'C',
    name: '通源 5 号腔',
    cameraPosition: { x: -87.9173, y: -512.3911, z: 127.0926 },
    controlsTarget: { x: -88.0456, y: -69.2963, z: 72.5082 },
    info: [
      { label: '深度', value: '960 m' },
      { label: '单腔容积', value: '15.1 万 m³' },
      { label: '岩盐密度', value: '2.15 g/cm³' },
      { label: '抗压强度', value: '25.3 MPa' },
      { label: '承压能力', value: '16.8 MPa' },
      { label: '蠕变速率', value: '0.041 %/年' },
    ],
  },
]

const selectedCaveLabel = computed(() => {
  if (activeCave.value) return activeCave.value.name
  return '选择盐穴'
})

const viewerRef = ref<HTMLDivElement | null>(null)
const uiLayer = ref<HTMLDivElement | null>(null)

const activeCaveId = computed(() => activeCave.value?.id ?? null)
const activeCaveName = computed(() => activeCave.value?.name ?? '—')

const caveData = [
  { id: 'A', name: '丰储 1 号腔', depth: '1080 m', volume: '12.6 万 m³', status: '运行中', statusColor: '#00fea9', healthScore: 92 },
  { id: 'B', name: '瑞盐 3 号腔', depth: '1240 m', volume: '8.3 万 m³', status: '运行中', statusColor: '#00fea9', healthScore: 88 },
  { id: 'C', name: '通源 5 号腔', depth: '960 m', volume: '15.1 万 m³', status: '巡检', statusColor: '#f1bd49', healthScore: 85 },
]

const handleSelectCave = (id: string) => {
  selectCave(id)
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const dismissCavePanel = () => {
  activeCave.value = null
}

const selectCave = (id: string) => {
  dropdownOpen.value = false
  const cave = caveList.find(c => c.id === id)
  if (!cave || !camera || !controls || isFlying.value) return

  isFlying.value = true
  activeCave.value = null

  const duration = 1500
  const startTime = performance.now()
  const startPos = camera.position.clone()
  const endPos = new THREE.Vector3(cave.cameraPosition.x, cave.cameraPosition.y, cave.cameraPosition.z)
  const startTarget = controls.target.clone()
  const endTarget = new THREE.Vector3(cave.controlsTarget.x, cave.controlsTarget.y, cave.controlsTarget.z)

  const tick = (now: number) => {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    const e = easeInOutCubic(t)

    if (camera && controls) {
      camera.position.lerpVectors(startPos, endPos, e)
      controls.target.lerpVectors(startTarget, endTarget, e)
      controls.update()
    }

    if (t < 1) {
      requestAnimationFrame(tick)
    } else {
      isFlying.value = false
      activeCave.value = cave
    }
  }

  requestAnimationFrame(tick)
}

const dismissAndGoBack = () => {
  activeCave.value = null
  goBack()
}

const dismissAndResetView = () => {
  activeCave.value = null
  handleResetView()
}

const dismissAndToggleModel = () => {
  activeCave.value = null
  dropdownOpen.value = false
  if (isMultipleModel.value) {
    switchToSingleModel()
  } else {
    flyToLinkView()
  }
}

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let animationId: number | null = null
let initialCameraPos: THREE.Vector3 | null = null
let initialControlsTarget: THREE.Vector3 | null = null
let currentMesh: THREE.Mesh | null = null

const initThreeScene = () => {
  if (!canvasRef.value || !viewerRef.value) return

  const width = viewerRef.value.clientWidth
  const height = viewerRef.value.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0e1a)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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
  loadingMessage.value = "正在加载盐穴单体模型..."

  const loader = new PLYLoader()

  try {
    const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
      loader.load(
        saltCaveSingleUrl,
        (geo) => resolve(geo),
        (progress) => {
          if (progress.total > 0) {
            const pct = Math.round((progress.loaded / progress.total) * 100)
            loadingMessage.value = `正在加载盐穴单体模型... ${pct}%`
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
    currentMesh = mesh

    controls.target.set(112.2045, -49.925, 229.3043)
    camera.position.set(137.2475, -3114.249, 970.0047)
    camera.lookAt(controls.target)
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

const handleResetView = () => {
  if (!camera || !controls || !initialCameraPos || !initialControlsTarget) return
  showMultipleLabel.value = false
  camera.position.copy(initialCameraPos)
  controls.target.copy(initialControlsTarget)
  controls.update()
}

const handleResize = () => {
  if (!renderer || !camera || !viewerRef.value) return
  const width = viewerRef.value.clientWidth
  const height = viewerRef.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  scaleUiLayer()
}

const scaleUiLayer = () => {
  if (!uiLayer.value || !viewerRef.value) return
  const width = viewerRef.value.clientWidth
  const height = viewerRef.value.clientHeight
  uiLayer.value.style.transform = `scale(${width / 1920}, ${height / 1080})`
}

const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const flyToLinkView = () => {
  if (!camera || !controls || isFlying.value || isMultipleModel.value) return

  isFlying.value = true
  showMultipleLabel.value = false

  const duration = 2000
  const startTime = performance.now()

  const startPos = camera.position.clone()
  const endPos = new THREE.Vector3(114.9699, -386.5373, 310.6609)

  const startTarget = controls.target.clone()
  const endTarget = new THREE.Vector3(112.2045, -49.925, 229.3043)

  const tick = (now: number) => {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    const e = easeInOutCubic(t)

    if (camera && controls) {
      camera.position.lerpVectors(startPos, endPos, e)
      controls.target.lerpVectors(startTarget, endTarget, e)
      controls.update()
    }

    if (t < 1) {
      requestAnimationFrame(tick)
    } else {
      isFlying.value = false
      showMultipleLabel.value = true
    }
  }

  requestAnimationFrame(tick)
}

const switchToMultipleModel = async () => {
  if (!scene || !camera || !controls || isSwitchingModel.value) return

  isSwitchingModel.value = true

  if (currentMesh) {
    scene.remove(currentMesh)
    currentMesh.geometry.dispose()
    if (Array.isArray(currentMesh.material)) {
      currentMesh.material.forEach(m => m.dispose())
    } else {
      currentMesh.material.dispose()
    }
    currentMesh = null
  }

  const loader = new PLYLoader()

  try {
    const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
      loader.load(
        saltCaveMultipleUrl,
        (geo) => resolve(geo),
        undefined,
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
    currentMesh = mesh
    showMultipleLabel.value = false
    isMultipleModel.value = true

    if (camera && controls) {
      camera.position.set(107.6844, -671.9135, 586.8035)
      controls.target.set(112.2045, -49.925, 229.3043)
      camera.lookAt(controls.target)
      controls.update()
    }
  } catch (err) {
    console.error("盐穴关联模型加载失败:", err)
  } finally {
    isSwitchingModel.value = false
  }
}

const switchToSingleModel = async () => {
  if (!scene || !camera || !controls || isSwitchingModel.value) return

  isSwitchingModel.value = true

  if (currentMesh) {
    scene.remove(currentMesh)
    currentMesh.geometry.dispose()
    if (Array.isArray(currentMesh.material)) {
      currentMesh.material.forEach(m => m.dispose())
    } else {
      currentMesh.material.dispose()
    }
    currentMesh = null
  }

  const loader = new PLYLoader()

  try {
    const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
      loader.load(
        saltCaveSingleUrl,
        (geo) => resolve(geo),
        undefined,
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
    currentMesh = mesh
    isMultipleModel.value = false

    camera.position.set(137.2475, -3114.249, 970.0047)
    controls.target.set(112.2045, -49.925, 229.3043)
    camera.lookAt(controls.target)
    controls.update()

    initialCameraPos = camera.position.clone()
    initialControlsTarget = controls.target.clone()
  } catch (err) {
    console.error("盐穴单体模型加载失败:", err)
  } finally {
    isSwitchingModel.value = false
  }
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

const goBack = () => {
  window.dispatchEvent(new CustomEvent("saltcave-subscene-close"))
  router.push("/saltCave")
}

onMounted(() => {
  nextTick(() => {
    initThreeScene()
    loadPLYModel()
    scaleUiLayer()
    requestAnimationFrame(scaleUiLayer)
  })
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
.salt-cave-single-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0a0e1a;
  overflow: hidden;
}

.viewer-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
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

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
  pointer-events: auto;

  > * {
    pointer-events: auto;
  }
}

.btn {
  padding: 8px 20px;
  background: rgba(23, 199, 254, 0.15);
  color: #17c7fe;
  border: 1px solid rgba(23, 199, 254, 0.4);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  backdrop-filter: blur(8px);
  transition: all 0.2s;

  &:hover {
    background: rgba(23, 199, 254, 0.3);
    border-color: rgba(23, 199, 254, 0.7);
  }
}

.link-btn {
  background: rgba(0, 230, 180, 0.15);
  color: #00e6b4;
  border-color: rgba(0, 230, 180, 0.4);

  &:hover:not(:disabled) {
    background: rgba(0, 230, 180, 0.3);
    border-color: rgba(0, 230, 180, 0.7);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.overview-btn {
  background: rgba(160, 120, 255, 0.15);
  color: #b490ff;
  border-color: rgba(160, 120, 255, 0.4);

  &:hover:not(:disabled) {
    background: rgba(160, 120, 255, 0.3);
    border-color: rgba(160, 120, 255, 0.7);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.debug-btn {
  background: rgba(255, 180, 0, 0.15);
  color: #ffb400;
  border-color: rgba(255, 180, 0, 0.4);

  &:hover {
    background: rgba(255, 180, 0, 0.3);
    border-color: rgba(255, 180, 0, 0.7);
  }
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.cave-dropdown {
  position: relative;

  .cave-select-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(80, 160, 255, 0.15);
    color: #50a0ff;
    border-color: rgba(80, 160, 255, 0.4);

    .arrow {
      font-size: 10px;
      transition: transform 0.2s;

      &.open {
        transform: rotate(180deg);
      }
    }

    &:hover:not(:disabled) {
      background: rgba(80, 160, 255, 0.3);
      border-color: rgba(80, 160, 255, 0.7);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 100%;
    background: rgba(0, 15, 40, 0.95);
    border: 1px solid rgba(80, 160, 255, 0.4);
    border-radius: 6px;
    overflow: hidden;
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    z-index: 200;

    .dropdown-item {
      padding: 8px 16px;
      color: #b9cfff;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;

      &:hover {
        background: rgba(80, 160, 255, 0.2);
        color: #fff;
      }

      &.active {
        background: rgba(80, 160, 255, 0.3);
        color: #50a0ff;
      }
    }
  }
}

.cave-info-panel {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 90;
  width: 280px;
  background: rgba(0, 15, 40, 0.92);
  border: 1px solid rgba(80, 160, 255, 0.4);
  border-radius: 10px;
  backdrop-filter: blur(14px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(80, 160, 255, 0.1);
  animation: panelSlideIn 0.35s ease-out;
  overflow: hidden;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(80, 160, 255, 0.1);
    border-bottom: 1px solid rgba(80, 160, 255, 0.2);

    .panel-title {
      font-size: 15px;
      font-weight: 600;
      color: #e0f0ff;
    }

    .panel-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
      padding: 0 4px;
      transition: color 0.15s;

      &:hover {
        color: #fff;
      }
    }
  }

  .panel-body {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .info-label {
        font-size: 13px;
        color: rgba(185, 207, 255, 0.7);
      }

      .info-value {
        font-size: 14px;
        color: #50a0ff;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
      }
    }
  }
}

@keyframes panelSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

.multiple-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  z-index: 90;
  pointer-events: auto;
  animation: labelPopIn 0.4s ease-out;

  .label-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    background: rgba(0, 20, 50, 0.9);
    border: 1px solid rgba(0, 230, 180, 0.5);
    border-radius: 10px;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 230, 180, 0.15);

    .label-title {
      font-size: 14px;
      color: #e0f0ff;
      font-weight: 500;
      white-space: nowrap;
    }

    .label-btn {
      padding: 8px 20px;
      background: linear-gradient(135deg, rgba(0, 230, 180, 0.25), rgba(0, 230, 180, 0.1));
      color: #00e6b4;
      border: 1px solid rgba(0, 230, 180, 0.6);
      border-radius: 5px;
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
      transition: all 0.2s;

      &:hover {
        background: linear-gradient(135deg, rgba(0, 230, 180, 0.45), rgba(0, 230, 180, 0.25));
        box-shadow: 0 0 14px rgba(0, 230, 180, 0.3);
      }
    }
  }

  .label-arrow {
    width: 0;
    height: 0;
    margin: 0 auto;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid rgba(0, 230, 180, 0.5);
  }
}

@keyframes labelPopIn {
  from {
    opacity: 0;
    transform: translate(-50%, -85%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1);
  }
}

// UI Layer 样式
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

.top-bar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 14px 28px;
  background: linear-gradient(90deg, rgba(8, 26, 44, 0.5), rgba(13, 50, 80, 0.7), rgba(8, 26, 44, 0.5));
  border: 1px solid rgba(95, 200, 255, 0.3);
  border-radius: 6px;
  pointer-events: auto;

  .brand {
    display: flex;
    flex-direction: column;
    color: #cfeaff;

    .brand-tag {
      font-family: Douyu, sans-serif;
      font-size: 22px;
      letter-spacing: 4px;
      color: #5fc8ff;
    }

    .brand-sub {
      font-size: 12px;
      color: #7ea7c4;
      margin-top: 2px;
      letter-spacing: 2px;
    }
  }

  .brand-stats {
    display: flex;
    gap: 24px;

    .stat {
      text-align: center;
      min-width: 96px;

      .stat-label {
        font-size: 12px;
        color: #6f95b3;
      }

      .stat-value {
        font-family: Douyu, sans-serif;
        font-size: 20px;
        color: #d4f7ff;
        margin-top: 4px;

        &.mode {
          color: #65f6c5;
        }
      }
    }
  }
}

.left-panel,
.right-panel {
  position: absolute;
  top: 110px;
  width: 460px;
  height: calc(100% - 230px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 18px;
  pointer-events: auto;
  overflow: hidden;

  :deep(.layout-panel) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .panel-body {
      flex: 1;
      min-height: 0;
      height: auto;

      .container {
        height: 100%;
      }
    }
  }
}

.left-panel {
  left: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.55), transparent);
}

.right-panel {
  right: 0;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.55), transparent);
  text-align: right;
}

.bottom-bar {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.bottom-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  background: rgba(8, 26, 44, 0.7);
  border: 1px solid rgba(95, 200, 255, 0.3);
  border-radius: 6px;
}

.ctrl-btn {
  padding: 8px 16px;
  background: rgba(20, 50, 80, 0.6);
  color: #cfeaff;
  border: 1px solid rgba(95, 200, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-family: Douyu, sans-serif;
  font-size: 14px;
  letter-spacing: 2px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(95, 200, 255, 0.25);
    box-shadow: 0 0 10px rgba(95, 200, 255, 0.35);
  }

  &.active {
    background: rgba(101, 246, 197, 0.25);
    border-color: rgba(101, 246, 197, 0.6);
    color: #65f6c5;
  }

  &.link-btn {
    background: rgba(0, 230, 180, 0.15);
    color: #00e6b4;
    border-color: rgba(0, 230, 180, 0.4);

    &:hover:not(:disabled) {
      background: rgba(0, 230, 180, 0.3);
      border-color: rgba(0, 230, 180, 0.7);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &.overview-btn {
    background: rgba(160, 120, 255, 0.15);
    color: #b490ff;
    border-color: rgba(160, 120, 255, 0.4);

    &:hover:not(:disabled) {
      background: rgba(160, 120, 255, 0.3);
      border-color: rgba(160, 120, 255, 0.7);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}
</style>
