import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  Triangle,
  Vector3,
  type Intersection,
  type Raycaster,
  type SkinnedMesh,
} from 'three'
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh'

/**
 * Skinned meshes raycast against their rest pose, so once a limb moves the
 * hits are wrong. Each mesh gets a static "proxy" copy of its current posed
 * geometry with a BVH, rebuilt when the pose settles, and raycasts go
 * through the proxy (fast and correct).
 */
export class PosedPicker {
  private proxies = new Map<SkinnedMesh, Mesh<BufferGeometry>>()
  private v = new Vector3()

  constructor(meshes: SkinnedMesh[]) {
    for (const mesh of meshes) {
      const geometry = new BufferGeometry()
      geometry.setIndex(mesh.geometry.index)
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(mesh.geometry.attributes.position.count * 3), 3))
      const proxy = new Mesh(geometry)
      proxy.raycast = acceleratedRaycast
      this.proxies.set(mesh, proxy)

      mesh.raycast = (raycaster: Raycaster, intersects: Intersection[]) => {
        proxy.matrixWorld.copy(mesh.matrixWorld)
        const before = intersects.length
        proxy.raycast(raycaster, intersects)
        for (let i = before; i < intersects.length; i++) intersects[i].object = mesh
      }
    }
    this.update()
  }

  /** Re-bakes every proxy to the meshes' current pose. */
  update() {
    for (const [mesh, proxy] of this.proxies) {
      mesh.skeleton.update()
      const pos = proxy.geometry.attributes.position as BufferAttribute
      for (let i = 0; i < pos.count; i++) {
        mesh.getVertexPosition(i, this.v)
        pos.setXYZ(i, this.v.x, this.v.y, this.v.z)
      }
      pos.needsUpdate = true
      const g = proxy.geometry as BufferGeometry & { boundsTree?: MeshBVH }
      if (g.boundsTree) g.boundsTree.refit()
      else g.boundsTree = new MeshBVH(g)
      g.computeBoundingSphere()
      g.computeBoundingBox()
    }
  }

  /** World-space bounds of a mesh in its current pose. */
  worldBox(mesh: SkinnedMesh) {
    const proxy = this.proxies.get(mesh)
    return proxy?.geometry.boundingBox?.clone().applyMatrix4(mesh.matrixWorld) ?? null
  }

  dispose() {
    for (const proxy of this.proxies.values()) {
      ;(proxy.geometry as BufferGeometry & { boundsTree?: MeshBVH }).boundsTree = undefined
      proxy.geometry.dispose()
    }
  }
}

/**
 * A point on a skinned mesh's surface that follows the mesh as it's posed
 * and reshaped: stored as a triangle plus barycentric weights.
 */
export class SurfaceAnchor {
  private a = new Vector3()
  private b = new Vector3()
  private c = new Vector3()
  private tri = new Triangle()
  readonly muscleId: string
  readonly mesh: SkinnedMesh
  private face: [number, number, number]
  private bary: Vector3

  constructor(muscleId: string, mesh: SkinnedMesh, face: [number, number, number], bary: Vector3) {
    this.muscleId = muscleId
    this.mesh = mesh
    this.face = face
    this.bary = bary
  }

  static fromHit(muscleId: string, hit: Intersection): SurfaceAnchor | null {
    if (!hit.face) return null
    const mesh = hit.object as SkinnedMesh
    const face: [number, number, number] = [hit.face.a, hit.face.b, hit.face.c]
    const anchor = new SurfaceAnchor(muscleId, mesh, face, new Vector3())
    anchor.corners()
    const local = mesh.worldToLocal(hit.point.clone())
    anchor.tri.getBarycoord(local, anchor.bary)
    return anchor
  }

  private corners() {
    this.mesh.getVertexPosition(this.face[0], this.a)
    this.mesh.getVertexPosition(this.face[1], this.b)
    this.mesh.getVertexPosition(this.face[2], this.c)
    this.tri.set(this.a, this.b, this.c)
  }

  /** Current world position and outward normal. */
  read(point: Vector3, normal: Vector3) {
    this.corners()
    point
      .set(0, 0, 0)
      .addScaledVector(this.a, this.bary.x)
      .addScaledVector(this.b, this.bary.y)
      .addScaledVector(this.c, this.bary.z)
      .applyMatrix4(this.mesh.matrixWorld)
    this.tri.getNormal(normal).transformDirection(this.mesh.matrixWorld)
  }
}
