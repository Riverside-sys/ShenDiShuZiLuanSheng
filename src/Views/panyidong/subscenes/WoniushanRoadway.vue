<!-- 卧牛山巷道点云子场景 -->
<template>
  <div class="woniushan-viewer" ref="viewerRef">
    <canvas ref="canvasRef" class="viewer-canvas"></canvas>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
        <div v-if="loadProgress > 0 && loadProgress < 100" class="progress-bar">
          <div class="progress-bar-inner" :style="{ width: loadProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-overlay">
      <div class="error-content">
        <h3>加载错误</h3>
        <p>{{ errorMessage }}</p>
        <button class="btn" @click="errorMessage = ''">关闭</button>
      </div>
    </div>

    <!-- 缩放 UI 层 -->
    <div class="ui-layer" ref="uiLayer">
      <!-- 顶部标题 -->
      <div class="top-bar">
        <div class="brand">
          <span class="brand-tag">卧牛山巷道</span>
          <span class="brand-sub">点云数字孪生 · 漫游巡检</span>
        </div>
        <div class="brand-stats">
          <div class="stat">
            <div class="stat-label">已加载分段</div>
            <div class="stat-value">{{ loadedSegmentCount }}/11</div>
          </div>
          <div class="stat">
            <div class="stat-label">浏览模式</div>
            <div class="stat-value mode">{{ modeLabel }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">当前分段</div>
            <div class="stat-value">{{ activeSegmentLabel }}</div>
          </div>
        </div>
      </div>

      <!-- 左侧面板 -->
      <div class="left-panel">
        <SegmentInspectionPanel
          :segments="segmentStatus"
          :active-id="activeSegmentId"
          @focus="handleFocusSegment"
        />
        <PointCloudQualityPanel :segments="segmentStatus" />
        <InspectionProgressPanel :progress="autoProgress" :running="mode === 'auto'" />
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <EnvMonitorPanel />
        <DeviceStatusPanel />
        <AlertDistributionPanel />
      </div>

      <!-- 底部控制栏 -->
      <div class="bottom-bar">
        <div class="bottom-controls">
          <button class="ctrl-btn" @click="goBack">返回</button>
          <button class="ctrl-btn" :class="{ active: mode === 'overview' }" @click="setMode('overview')">总览</button>
          <button class="ctrl-btn primary" @click="handleEnterRoadway" :disabled="!hasCenterline">进入巷道</button>
          <button class="ctrl-btn" :class="{ active: mode === 'roam' }" @click="setMode('roam')">漫游</button>
          <button class="ctrl-btn" :class="{ active: mode === 'auto' }" @click="toggleAuto">{{ mode === 'auto' ? '暂停巡检' : '自动巡检' }}</button>
          <button class="ctrl-btn" @click="handleResetView">重置视角</button>
          <button class="ctrl-btn" @click="handleExportCameraState">输出相机</button>
          <div class="segment-jumper">
            <span class="jumper-label">分段定位</span>
            <button
              v-for="seg in segmentStatus"
              :key="seg.id"
              class="seg-btn"
              :class="{ active: activeSegmentId === seg.id }"
              @click="handleFocusSegment(seg.id)"
            >{{ seg.id.toString().padStart(2, '0') }}</button>
          </div>
        </div>
        <div class="key-hint">
          <span>进入巷道后：</span>
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          <span>沿巷道前进</span>
          <kbd>Q</kbd><kbd>E</kbd>
          <span>升降</span>
          <kbd>Shift</kbd>
          <span>加速</span>
          <kbd>点击锁定鼠标</kbd>
          <span>左右转向</span>
        </div>
      </div>

      <div v-if="mode === 'roam' && !pointerLocked" class="roam-hint">
        点击场景获取焦点后即可使用 WASD 漫游
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { woniushanMergedUrl, woniushanSegments } from '../data'
import SegmentInspectionPanel from '../components/Charts/Woniushan/SegmentInspectionPanel.vue'
import PointCloudQualityPanel from '../components/Charts/Woniushan/PointCloudQualityPanel.vue'
import InspectionProgressPanel from '../components/Charts/Woniushan/InspectionProgressPanel.vue'
import EnvMonitorPanel from '../components/Charts/Woniushan/EnvMonitorPanel.vue'
import DeviceStatusPanel from '../components/Charts/Woniushan/DeviceStatusPanel.vue'
import AlertDistributionPanel from '../components/Charts/Woniushan/AlertDistributionPanel.vue'

const router = useRouter()

const viewerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const uiLayer = ref<HTMLDivElement | null>(null)

const isLoading = ref(true)
const loadingMessage = ref('正在初始化场景...')
const loadProgress = ref(0)
const errorMessage = ref('')

type SceneMode = 'overview' | 'roam' | 'auto'
const mode = ref<SceneMode>('overview')
const pointerLocked = ref(false)
const autoProgress = ref(0)
const activeSegmentId = ref<number | null>(null)

interface SegmentStatus {
  id: number
  name: string
  loaded: boolean
  pointCount: number
  hasColor: boolean
  qualityScore: number
  center: THREE.Vector3 | null
  size: THREE.Vector3 | null
}

const segmentStatus = ref<SegmentStatus[]>(
  woniushanSegments.map((seg) => ({
    id: seg.id,
    name: seg.name,
    loaded: false,
    pointCount: 0,
    hasColor: false,
    qualityScore: 0,
    center: null,
    size: null,
  }))
)

const loadedSegmentCount = computed(() => segmentStatus.value.filter((s) => s.loaded).length)
const modeLabel = computed(() => ({ overview: '总览', roam: '漫游', auto: '自动巡检' }[mode.value]))
const hasCenterline = ref(false)
const activeSegmentLabel = computed(() => {
  if (activeSegmentId.value == null) return '—'
  const s = segmentStatus.value.find((x) => x.id === activeSegmentId.value)
  return s ? s.name : '—'
})

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let animationId: number | null = null
let mergedPoints: THREE.Points | THREE.Mesh | null = null
let mergedBBox: THREE.Box3 | null = null
let mergedCenter = new THREE.Vector3()
let mergedSize = new THREE.Vector3()

const initialCameraPos = new THREE.Vector3()
const initialTarget = new THREE.Vector3()

const keyState: Record<string, boolean> = {}
let mouseDown = false
let lastMouseX = 0
let lastMouseY = 0
const cameraEuler = new THREE.Euler(0, 0, 0, 'YXZ')

let autoStartTime = 0
let autoDuration = 60_000

let segmentCache = new Map<number, THREE.Points | THREE.Mesh>()
const segmentGroup = new THREE.Group()

let centerlineCurve: THREE.CatmullRomCurve3 | null = null
let longAxis: 'x' | 'y' | 'z' = 'x'
let centerlineHelper: THREE.Line | null = null
let roamUnitsPerSec = 8
let roamUnitsPerSecFast = 28
const MOUSE_SENSITIVITY = 0.0025

const setupRenderer = () => {
  if (!canvasRef.value || !viewerRef.value) return
  const width = viewerRef.value.clientWidth || window.innerWidth
  const height = viewerRef.value.clientHeight || window.innerHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x06121f)
  scene.fog = new THREE.FogExp2(0x06121f, 0.0008)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 50000)
  camera.position.set(0, 80, 200)
  camera.lookAt(0, 0, 0)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.screenSpacePanning = true
  controls.minDistance = 1
  controls.maxDistance = 5000

  scene.add(new THREE.AmbientLight(0xffffff, 0.9))
  const dl1 = new THREE.DirectionalLight(0x9bd4ff, 0.6)
  dl1.position.set(500, 800, 300)
  scene.add(dl1)
  const dl2 = new THREE.DirectionalLight(0xffffff, 0.4)
  dl2.position.set(-300, -200, -500)
  scene.add(dl2)

  const grid = new THREE.GridHelper(2000, 40, 0x1a4a7a, 0x0d2b46)
  ;(grid.material as THREE.Material).transparent = true
  ;(grid.material as THREE.Material).opacity = 0.35
  grid.position.y = -2
  scene.add(grid)

  segmentGroup.visible = true
  scene.add(segmentGroup)
}

const loadPLY = (url: string, onProgress?: (pct: number) => void): Promise<THREE.BufferGeometry> => {
  const loader = new PLYLoader()
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (geo) => resolve(geo),
      (ev) => {
        if (ev.total > 0 && onProgress) {
          onProgress(Math.round((ev.loaded / ev.total) * 100))
        }
      },
      (err) => reject(err)
    )
  })
}

const buildObjectFromGeometry = (
  geometry: THREE.BufferGeometry,
  options: { pointColor?: number; meshColor?: number; pointSize?: number } = {}
): THREE.Points | THREE.Mesh => {
  const hasIndex = geometry.index != null && geometry.index.count > 0
  const hasColor = geometry.hasAttribute('color')

  if (hasIndex) {
    geometry.computeVertexNormals()
    const material = new THREE.MeshStandardMaterial({
      color: hasColor ? 0xffffff : options.meshColor ?? 0x8fbfff,
      vertexColors: hasColor,
      side: THREE.DoubleSide,
      roughness: 0.85,
      metalness: 0.05,
    })
    return new THREE.Mesh(geometry, material)
  }

  const material = new THREE.PointsMaterial({
    size: options.pointSize ?? 0.25,
    sizeAttenuation: true,
    vertexColors: hasColor,
    color: hasColor ? 0xffffff : options.pointColor ?? 0x6fb0ff,
    transparent: true,
    opacity: 0.95,
  })
  return new THREE.Points(geometry, material)
}

const loadMergedMesh = async () => {
  if (!scene || !camera || !controls) return

  loadingMessage.value = '正在加载卧牛山合并巷道...'
  loadProgress.value = 0

  try {
    const geometry = await loadPLY(woniushanMergedUrl, (pct) => {
      loadProgress.value = pct
      loadingMessage.value = `正在加载卧牛山合并巷道... ${pct}%`
    })

    mergedPoints = buildObjectFromGeometry(geometry, { pointSize: 0.18 })
    scene.add(mergedPoints)

    geometry.computeBoundingBox()
    mergedBBox = geometry.boundingBox?.clone() ?? new THREE.Box3().setFromObject(mergedPoints)
    mergedBBox.getCenter(mergedCenter)
    mergedBBox.getSize(mergedSize)

    const maxDim = Math.max(mergedSize.x, mergedSize.y, mergedSize.z)
    const fitDist = maxDim * 1.4
    const camPos = new THREE.Vector3(
      mergedCenter.x + fitDist * 0.6,
      mergedCenter.y + maxDim * 0.6,
      mergedCenter.z + fitDist * 0.8
    )
    camera.position.copy(camPos)
    controls.target.copy(mergedCenter)
    controls.update()

    initialCameraPos.copy(camPos)
    initialTarget.copy(mergedCenter)

    loadingMessage.value = '正在分析巷道中线...'
    await nextTick()
    computeCenterline(geometry)
    setupRoamSpeed()

    loadingMessage.value = '加载完成'
    loadProgress.value = 100
  } catch (err) {
    console.error('卧牛山合并模型加载失败:', err)
    errorMessage.value = `卧牛山合并模型加载失败：${err instanceof Error ? err.message : String(err)}`
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 400)
  }
}

const ensureSegmentLoaded = async (id: number): Promise<SegmentStatus | null> => {
  const status = segmentStatus.value.find((s) => s.id === id)
  if (!status) return null
  if (status.loaded) return status

  const seg = woniushanSegments.find((s) => s.id === id)
  if (!seg) return null

  try {
    const geometry = await loadPLY(seg.url)
    const obj = buildObjectFromGeometry(geometry, {
      pointSize: 0.22,
      pointColor: 0x65f6c5,
      meshColor: 0x65f6c5,
    })
    if (obj instanceof THREE.Points) {
      ;(obj.material as THREE.PointsMaterial).color.setHex(0x65f6c5)
    }
    obj.visible = false
    segmentGroup.add(obj)
    segmentCache.set(id, obj)

    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox?.clone() ?? new THREE.Box3().setFromObject(obj)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    bbox.getCenter(center)
    bbox.getSize(size)

    const pos = geometry.getAttribute('position')
    status.pointCount = pos ? pos.count : 0
    status.hasColor = geometry.hasAttribute('color')
    status.qualityScore = computeQualityScore(status.pointCount, status.hasColor)
    status.center = center
    status.size = size
    status.loaded = true

    return status
  } catch (err) {
    console.warn(`分段 ${id} 加载失败:`, err)
    return null
  }
}

const computeQualityScore = (pointCount: number, hasColor: boolean) => {
  const base = Math.min(100, Math.round((pointCount / 500_000) * 70))
  return Math.min(100, base + (hasColor ? 15 : 0) + 15)
}

// 从合并模型点云中按长轴切片抽取中线
const computeCenterline = (geometry: THREE.BufferGeometry) => {
  const positions = geometry.getAttribute('position')
  if (!positions || !mergedBBox) return

  if (mergedSize.x >= mergedSize.y && mergedSize.x >= mergedSize.z) longAxis = 'x'
  else if (mergedSize.z >= mergedSize.y) longAxis = 'z'
  else longAxis = 'y'

  const sliceCount = 80
  const minV = mergedBBox.min[longAxis]
  const maxV = mergedBBox.max[longAxis]
  const sliceWidth = (maxV - minV) / sliceCount
  if (sliceWidth <= 0) return

  const sumX = new Float64Array(sliceCount)
  const sumY = new Float64Array(sliceCount)
  const sumZ = new Float64Array(sliceCount)
  const count = new Int32Array(sliceCount)

  const n = positions.count
  for (let i = 0; i < n; i++) {
    const x = positions.getX(i)
    const y = positions.getY(i)
    const z = positions.getZ(i)
    const val = longAxis === 'x' ? x : longAxis === 'y' ? y : z
    let idx = Math.floor((val - minV) / sliceWidth)
    if (idx < 0) idx = 0
    if (idx >= sliceCount) idx = sliceCount - 1
    sumX[idx] += x
    sumY[idx] += y
    sumZ[idx] += z
    count[idx]++
  }

  const pts: THREE.Vector3[] = []
  for (let i = 0; i < sliceCount; i++) {
    if (count[i] > 50) {
      pts.push(
        new THREE.Vector3(sumX[i] / count[i], sumY[i] / count[i], sumZ[i] / count[i])
      )
    }
  }

  if (pts.length >= 2) {
    centerlineCurve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
    buildCenterlineHelper()
    hasCenterline.value = true
  } else {
    centerlineCurve = null
    hasCenterline.value = false
  }
}

const buildCenterlineHelper = () => {
  if (!scene || !centerlineCurve) return
  if (centerlineHelper) {
    scene.remove(centerlineHelper)
    centerlineHelper.geometry.dispose()
    ;(centerlineHelper.material as THREE.Material).dispose()
    centerlineHelper = null
  }
  const samples = centerlineCurve.getPoints(200)
  const geom = new THREE.BufferGeometry().setFromPoints(samples)
  const mat = new THREE.LineBasicMaterial({
    color: 0x65f6c5,
    transparent: true,
    opacity: 0.35,
  })
  centerlineHelper = new THREE.Line(geom, mat)
  centerlineHelper.visible = false
  scene.add(centerlineHelper)
}

const sampleCenterline = (t: number) => {
  if (!centerlineCurve) return null
  const tt = Math.max(0, Math.min(1, t))
  const pos = centerlineCurve.getPoint(tt)
  const tangent = centerlineCurve.getTangent(tt).normalize()
  return { pos, tangent }
}

const findNearestCenterlineT = (target: THREE.Vector3): number => {
  if (!centerlineCurve) return 0
  const samples = 200
  let bestT = 0
  let bestDist = Infinity
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const p = centerlineCurve.getPoint(t)
    const d = p.distanceToSquared(target)
    if (d < bestDist) {
      bestDist = d
      bestT = t
    }
  }
  return bestT
}

const setupRoamSpeed = () => {
  const maxDim = Math.max(mergedSize.x, mergedSize.y, mergedSize.z)
  if (maxDim <= 0) return
  roamUnitsPerSec = Math.max(0.5, maxDim / 30)
  roamUnitsPerSecFast = roamUnitsPerSec * 3.5
}

const handleEnterRoadway = () => {
  if (!camera || !controls) return
  if (!centerlineCurve) return
  if (mode.value === 'auto') stopAuto()

  const sample = sampleCenterline(0.02)
  const ahead = sampleCenterline(0.06)
  if (!sample || !ahead) return

  setMode('roam')

  camera.position.copy(sample.pos)
  camera.lookAt(ahead.pos)
  cameraEuler.setFromQuaternion(camera.quaternion)

  activeSegmentId.value = segmentStatus.value[0]?.id ?? null
  Array.from(segmentCache.values()).forEach((obj) => {
    obj.visible = false
  })
  if (mergedPoints) mergedPoints.visible = true
}

const handleFocusSegment = async (id: number) => {
  if (!camera || !controls) return
  if (mode.value === 'auto') stopAuto()

  const status = await ensureSegmentLoaded(id)
  if (!status || !status.center) return

  Array.from(segmentCache.entries()).forEach(([sid, obj]) => {
    obj.visible = sid === id
  })
  if (mergedPoints) mergedPoints.visible = true

  activeSegmentId.value = id

  if (centerlineCurve) {
    if (mode.value !== 'overview') setMode('overview')
    const t = findNearestCenterlineT(status.center)
    const sample = sampleCenterline(t)
    const ahead = sampleCenterline(Math.min(1, t + 0.03))
    if (sample && ahead) {
      flyTo(sample.pos, ahead.pos, 1400)
      return
    }
  }

  if (mode.value !== 'overview') setMode('overview')
  const maxDim = status.size ? Math.max(status.size.x, status.size.y, status.size.z) : 30
  const dist = Math.max(maxDim * 1.6, 30)
  const endPos = new THREE.Vector3(
    status.center.x + dist * 0.5,
    status.center.y + maxDim * 0.6 + 10,
    status.center.z + dist * 0.7
  )
  flyTo(endPos, status.center, 1400)
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

let flyingRAF: number | null = null
const flyTo = (endPos: THREE.Vector3, endTarget: THREE.Vector3, duration = 1200) => {
  if (!camera || !controls) return
  if (flyingRAF != null) cancelAnimationFrame(flyingRAF)

  const startPos = camera.position.clone()
  const startTarget = controls.target.clone()
  const startTime = performance.now()

  const step = (now: number) => {
    if (!camera || !controls) return
    const t = Math.min((now - startTime) / duration, 1)
    const e = easeInOutCubic(t)
    camera.position.lerpVectors(startPos, endPos, e)
    controls.target.lerpVectors(startTarget, endTarget, e)
    controls.update()
    if (t < 1) {
      flyingRAF = requestAnimationFrame(step)
    } else {
      flyingRAF = null
    }
  }
  flyingRAF = requestAnimationFrame(step)
}

const handleResetView = () => {
  if (mode.value === 'auto') stopAuto()
  if (mode.value !== 'overview') setMode('overview')
  activeSegmentId.value = null
  Array.from(segmentCache.values()).forEach((obj) => {
    obj.visible = false
  })
  if (mergedPoints) mergedPoints.visible = true
  flyTo(initialCameraPos, initialTarget, 1000)
}

const formatVector3 = (v: THREE.Vector3) => ({
  x: Number(v.x.toFixed(6)),
  y: Number(v.y.toFixed(6)),
  z: Number(v.z.toFixed(6)),
})

const formatEuler = (e: THREE.Euler) => ({
  x: Number(e.x.toFixed(6)),
  y: Number(e.y.toFixed(6)),
  z: Number(e.z.toFixed(6)),
  order: e.order,
})

const formatQuaternion = (q: THREE.Quaternion) => ({
  x: Number(q.x.toFixed(6)),
  y: Number(q.y.toFixed(6)),
  z: Number(q.z.toFixed(6)),
  w: Number(q.w.toFixed(6)),
})

const handleExportCameraState = async () => {
  if (!camera) return

  const cameraState = {
    mode: mode.value,
    activeSegmentId: activeSegmentId.value,
    position: formatVector3(camera.position),
    rotation: formatEuler(camera.rotation),
    quaternion: formatQuaternion(camera.quaternion),
    target: controls ? formatVector3(controls.target) : null,
    fov: camera.fov,
    near: camera.near,
    far: camera.far,
    zoom: camera.zoom,
  }
  const payload = JSON.stringify(cameraState, null, 2)

  console.log('[卧牛山巷道] 当前相机状态：', cameraState)
  console.log(payload)

  try {
    await navigator.clipboard?.writeText(payload)
    console.info('[卧牛山巷道] 当前相机状态已复制到剪贴板')
  } catch (err) {
    console.warn('[卧牛山巷道] 相机状态复制到剪贴板失败，请从控制台复制', err)
  }
}

const setMode = (next: SceneMode) => {
  if (mode.value === next) return

  if (mode.value === 'roam') {
    exitPointerLock()
  }
  if (mode.value === 'auto') stopAuto()

  mode.value = next

  if (controls) {
    controls.enabled = next === 'overview'
  }
}

const toggleAuto = () => {
  if (mode.value === 'auto') {
    stopAuto()
    setMode('overview')
  } else {
    startAuto()
  }
}

let autoPath: { pos: THREE.Vector3; target: THREE.Vector3 }[] = []

const buildAutoPath = (outside = false) => {
  autoPath = []

  if (!outside && centerlineCurve) {
    const steps = 80
    const lookAhead = 0.025
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const pos = centerlineCurve.getPoint(t)
      const target = centerlineCurve.getPoint(Math.min(1, t + lookAhead))
      autoPath.push({ pos, target })
    }
    return
  }

  if (!mergedBBox) return
  const minPt = mergedBBox.min
  const maxPt = mergedBBox.max
  const steps = 24
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const target = new THREE.Vector3(
      THREE.MathUtils.lerp(minPt.x, maxPt.x, longAxis === 'x' ? t : 0.5),
      THREE.MathUtils.lerp(minPt.y, maxPt.y, longAxis === 'y' ? t : 0.5),
      THREE.MathUtils.lerp(minPt.z, maxPt.z, longAxis === 'z' ? t : 0.5)
    )
    const lift = mergedSize.y * 0.25 + 8
    const lateralOffset = Math.max(mergedSize.x, mergedSize.z) * 0.25 + 12
    const pos = target.clone()
    if (longAxis === 'x') {
      pos.z += lateralOffset
      pos.y += lift
    } else if (longAxis === 'z') {
      pos.x += lateralOffset
      pos.y += lift
    } else {
      pos.x += lateralOffset
      pos.z += lateralOffset * 0.5
    }
    autoPath.push({ pos, target })
  }
}

const startAuto = (outside = false) => {
  if (!camera || !controls || !mergedBBox) return
  buildAutoPath(outside)
  if (autoPath.length < 2) return
  mode.value = 'auto'
  if (controls) controls.enabled = false
  autoProgress.value = 0
  autoStartTime = performance.now()
}

const stopAuto = () => {
  autoProgress.value = 0
}

const tickAuto = () => {
  if (mode.value !== 'auto' || !camera || autoPath.length < 2) return
  const elapsed = performance.now() - autoStartTime
  const t = Math.min(elapsed / autoDuration, 1)
  autoProgress.value = Math.round(t * 100)

  const totalSegs = autoPath.length - 1
  const segIdx = Math.min(Math.floor(t * totalSegs), totalSegs - 1)
  const localT = t * totalSegs - segIdx
  const e = easeInOutCubic(localT)

  const a = autoPath[segIdx]
  const b = autoPath[segIdx + 1]
  camera.position.lerpVectors(a.pos, b.pos, e)
  const lookAt = new THREE.Vector3().lerpVectors(a.target, b.target, e)
  camera.lookAt(lookAt)

  const seg = segmentStatus.value[Math.min(Math.floor(t * 11), 10)]
  if (seg && activeSegmentId.value !== seg.id) {
    activeSegmentId.value = seg.id
  }

  if (t >= 1) {
    stopAuto()
    setMode('overview')
    if (controls) {
      controls.target.copy(autoPath[autoPath.length - 1].target)
      controls.update()
    }
  }
}

const tickRoam = (dt: number) => {
  if (!camera) return
  const forward = new THREE.Vector3()
  camera.getWorldDirection(forward)
  forward.normalize()
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

  const speed = (keyState['shift'] ? roamUnitsPerSecFast : roamUnitsPerSec) * dt
  const move = new THREE.Vector3()
  if (keyState['w']) move.add(forward)
  if (keyState['s']) move.sub(forward)
  if (keyState['d']) move.add(right)
  if (keyState['a']) move.sub(right)
  if (keyState['q']) move.y -= 1
  if (keyState['e']) move.y += 1
  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(speed)
    camera.position.add(move)
  }
}

let lastFrame = performance.now()
const animate = () => {
  animationId = requestAnimationFrame(animate)
  const now = performance.now()
  const dt = Math.min((now - lastFrame) / 1000, 0.05)
  lastFrame = now

  if (mode.value === 'overview' && controls) {
    controls.update()
  } else if (mode.value === 'roam') {
    tickRoam(dt)
  } else if (mode.value === 'auto') {
    tickAuto()
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Shift') keyState['shift'] = true
  const k = e.key.toLowerCase()
  if (['w', 'a', 's', 'd', 'q', 'e'].includes(k)) {
    keyState[k] = true
    if (mode.value !== 'roam') return
    e.preventDefault()
  }
}

const onKeyUp = (e: KeyboardEvent) => {
  if (e.key === 'Shift') keyState['shift'] = false
  const k = e.key.toLowerCase()
  if (['w', 'a', 's', 'd', 'q', 'e'].includes(k)) {
    keyState[k] = false
  }
}

const onMouseDown = (e: MouseEvent) => {
  if (mode.value !== 'roam') return
  mouseDown = true
  lastMouseX = e.clientX
  lastMouseY = e.clientY
}

const onMouseUp = () => {
  mouseDown = false
}

const onMouseMove = (e: MouseEvent) => {
  if (mode.value !== 'roam') return
  if (!pointerLocked.value && !mouseDown) return
  if (!camera) return

  const dx = pointerLocked.value ? e.movementX : e.clientX - lastMouseX
  const dy = pointerLocked.value ? e.movementY : e.clientY - lastMouseY
  lastMouseX = e.clientX
  lastMouseY = e.clientY

  cameraEuler.setFromQuaternion(camera.quaternion)
  cameraEuler.y -= dx * MOUSE_SENSITIVITY
  cameraEuler.x -= dy * MOUSE_SENSITIVITY
  cameraEuler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, cameraEuler.x))
  camera.quaternion.setFromEuler(cameraEuler)
}

const onCanvasClick = () => {
  if (mode.value !== 'roam') return
  requestPointerLock()
}

const requestPointerLock = () => {
  const el = canvasRef.value
  if (!el) return
  if (document.pointerLockElement === el) return
  try {
    el.requestPointerLock()
  } catch (e) {
    console.warn('pointer lock failed', e)
  }
}

const exitPointerLock = () => {
  if (document.pointerLockElement === canvasRef.value) {
    document.exitPointerLock()
  }
}

const onPointerLockChange = () => {
  pointerLocked.value = document.pointerLockElement === canvasRef.value
}

const handleResize = () => {
  if (!viewerRef.value || !renderer || !camera) return
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

const goBack = () => {
  router.push({ name: 'panyidong' })
}

onMounted(async () => {
  await nextTick()
  setupRenderer()
  scaleUiLayer()
  animate()
  loadMergedMesh()

  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousemove', onMouseMove)
  document.addEventListener('pointerlockchange', onPointerLockChange)

  const canvas = canvasRef.value
  canvas?.addEventListener('mousedown', onMouseDown)
  canvas?.addEventListener('mouseup', onMouseUp)
  canvas?.addEventListener('click', onCanvasClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('pointerlockchange', onPointerLockChange)

  const canvas = canvasRef.value
  canvas?.removeEventListener('mousedown', onMouseDown)
  canvas?.removeEventListener('mouseup', onMouseUp)
  canvas?.removeEventListener('click', onCanvasClick)

  exitPointerLock()

  if (animationId != null) cancelAnimationFrame(animationId)
  if (flyingRAF != null) cancelAnimationFrame(flyingRAF)

  const disposeObj = (obj: THREE.Object3D | null) => {
    if (!obj) return
    obj.traverse?.((child: any) => {
      if (child.geometry) child.geometry.dispose?.()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => m.dispose?.())
        } else {
          child.material.dispose?.()
        }
      }
    })
  }
  disposeObj(mergedPoints)
  segmentCache.forEach((o) => disposeObj(o))
  segmentCache.clear()

  if (centerlineHelper) {
    centerlineHelper.geometry.dispose()
    ;(centerlineHelper.material as THREE.Material).dispose()
    centerlineHelper = null
  }
  centerlineCurve = null

  controls?.dispose()
  renderer?.dispose()

  scene = null
  camera = null
  controls = null
  renderer = null
  mergedPoints = null
})
</script>

<style scoped lang="scss">
.woniushan-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #06121f;
}

.viewer-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  background: rgba(6, 18, 31, 0.85);
}

.loading-content,
.error-content {
  text-align: center;
  color: #cfeaff;
  padding: 28px 40px;
  border: 1px solid rgba(95, 200, 255, 0.3);
  border-radius: 10px;
  background: rgba(8, 26, 44, 0.85);
  backdrop-filter: blur(6px);
  min-width: 280px;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 3px solid rgba(95, 200, 255, 0.2);
  border-top-color: #5fc8ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-bar {
  margin-top: 14px;
  width: 240px;
  height: 6px;
  background: rgba(95, 200, 255, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #5fc8ff, #65f6c5);
  transition: width 0.2s ease;
}

.btn {
  background: rgba(95, 200, 255, 0.2);
  color: #cfeaff;
  border: 1px solid rgba(95, 200, 255, 0.4);
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
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
  gap: 20px;
  padding: 0 18px;
  pointer-events: auto;
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

  &.primary {
    background: rgba(101, 246, 197, 0.2);
    border-color: rgba(101, 246, 197, 0.6);
    color: #65f6c5;

    &:hover:not(:disabled) {
      background: rgba(101, 246, 197, 0.35);
      box-shadow: 0 0 12px rgba(101, 246, 197, 0.55);
    }
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.segment-jumper {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  padding-left: 14px;
  border-left: 1px solid rgba(95, 200, 255, 0.25);

  .jumper-label {
    font-size: 12px;
    color: #6f95b3;
    margin-right: 4px;
  }

  .seg-btn {
    width: 30px;
    height: 30px;
    background: rgba(20, 50, 80, 0.55);
    color: #9ec5e0;
    border: 1px solid rgba(95, 200, 255, 0.25);
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;

    &:hover {
      background: rgba(95, 200, 255, 0.2);
      color: #d4f7ff;
    }

    &.active {
      background: rgba(101, 246, 197, 0.25);
      border-color: rgba(101, 246, 197, 0.7);
      color: #65f6c5;
    }
  }
}

.key-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #7ea7c4;

  kbd {
    display: inline-block;
    padding: 2px 8px;
    background: rgba(20, 50, 80, 0.65);
    color: #cfeaff;
    border: 1px solid rgba(95, 200, 255, 0.3);
    border-radius: 3px;
    font-family: Consolas, monospace;
    font-size: 11px;
  }
}

.roam-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 22px;
  background: rgba(8, 26, 44, 0.75);
  color: #cfeaff;
  border: 1px solid rgba(95, 200, 255, 0.45);
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
}
</style>
