import * as THREE from 'three'

export interface RoadwayOverviewCameraInput {
  bounds: THREE.Box3
  nearPoint: THREE.Vector3
  farPoint: THREE.Vector3
  targetPoint: THREE.Vector3
  fitPoints?: readonly THREE.Vector3[]
  aspect: number
  fov: number
  pitchDegrees?: number
  yawDegrees?: number
  horizontalFill?: number
  verticalFill?: number
}

export interface RoadwayOverviewCameraState {
  position: THREE.Vector3
  target: THREE.Vector3
  near: number
  far: number
  up: THREE.Vector3
  horizontalFill: number
  verticalFill: number
  fittedPoints: THREE.Vector3[]
}

const getBoxCorners = (bounds: THREE.Box3) => {
  const { min, max } = bounds
  return [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ]
}

export const calculateRoadwayOverviewCamera = ({
  bounds,
  nearPoint,
  farPoint,
  targetPoint,
  fitPoints,
  aspect,
  fov,
  pitchDegrees = 55,
  yawDegrees = 10,
  horizontalFill = 0.74,
  verticalFill = 0.86,
}: RoadwayOverviewCameraInput): RoadwayOverviewCameraState => {
  const worldUp = new THREE.Vector3(0, 0, 1)
  const horizontalDirection = farPoint.clone().sub(nearPoint)
  horizontalDirection.z = 0
  if (horizontalDirection.lengthSq() < 1e-6) {
    horizontalDirection.set(1, 0, 0)
  }
  horizontalDirection
    .normalize()
    .applyAxisAngle(worldUp, THREE.MathUtils.degToRad(yawDegrees))

  const pitch = THREE.MathUtils.degToRad(pitchDegrees)
  const viewDirection = horizontalDirection
    .multiplyScalar(Math.cos(pitch))
    .addScaledVector(worldUp, -Math.sin(pitch))
    .normalize()
  const right = new THREE.Vector3().crossVectors(viewDirection, worldUp).normalize()
  const cameraUp = new THREE.Vector3().crossVectors(right, viewDirection).normalize()

  const safeAspect = Math.max(aspect, 0.1)
  const tanVertical = Math.tan(THREE.MathUtils.degToRad(fov / 2))
  const tanHorizontal = tanVertical * safeAspect
  const points =
    fitPoints && fitPoints.length >= 2
      ? fitPoints.map((point) => point.clone())
      : getBoxCorners(bounds)
  let requiredDistance = 0
  let minForwardOffset = Infinity
  let maxForwardOffset = -Infinity

  for (const point of points) {
    const relative = point.clone().sub(targetPoint)
    const forwardOffset = relative.dot(viewDirection)
    const horizontalOffset = Math.abs(relative.dot(right))
    const verticalOffset = Math.abs(relative.dot(cameraUp))
    requiredDistance = Math.max(
      requiredDistance,
      horizontalOffset / (tanHorizontal * horizontalFill) - forwardOffset,
      verticalOffset / (tanVertical * verticalFill) - forwardOffset
    )
    minForwardOffset = Math.min(minForwardOffset, forwardOffset)
    maxForwardOffset = Math.max(maxForwardOffset, forwardOffset)
  }

  const size = bounds.getSize(new THREE.Vector3())
  const diagonal = Math.max(size.length(), 1)
  requiredDistance = Math.max(requiredDistance, -minForwardOffset + diagonal * 0.02)
  const distance = requiredDistance * 1.02
  const position = targetPoint.clone().addScaledVector(viewDirection, -distance)
  const near = Math.max(diagonal / 10_000, 0.1)
  const far = Math.max(distance + maxForwardOffset + diagonal * 2, 1000)

  return {
    position,
    target: targetPoint.clone(),
    near,
    far,
    up: cameraUp,
    horizontalFill,
    verticalFill,
    fittedPoints: points,
  }
}
