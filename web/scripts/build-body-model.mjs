// Builds web/public/models/body.glb from the BodyParts3D data pack
// (@somakine/bodyparts3d-musculoskeletal, CC BY 4.0).
//
//   node scripts/build-body-model.mjs <path-to-pack>/package/public
//
// The pack ships ~33 MB of regional GLBs with one node per source mesh. This
// script keeps only what the explorer renders, groups the muscle meshes into
// the app's muscle ids (one node per id and side), joins all bones into one
// mesh, recentres the figure on the origin, then simplifies and compresses.

import { Document, NodeIO } from '@gltf-transform/core'
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions'
import {
  clearNodeTransform,
  dedup,
  joinPrimitives,
  mergeDocuments,
  prune,
  quantize,
  simplifyPrimitive,
  unpartition,
  weld,
} from '@gltf-transform/functions'
import { readFileSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'
import { WRAP_SLUGS, buildRadiusField, latissimusDorsi, rectusAbdominis } from './lib/synthesize.mjs'

// BodyParts3D structure slug → explorer muscle id (backend/data/muscles.json).
// Muscles not listed here are rendered as non-selectable context.
const MUSCLE_GROUPS = {
  sternocleidomastoid: 'neck',
  'levator-scapulae': 'neck',
  trapezius: 'traps',
  deltoid: 'delts',
  'pectoralis-major': 'chest',
  'pectoralis-minor': 'chest',
  'biceps-brachii': 'biceps',
  'triceps-brachii': 'triceps',
  brachioradialis: 'forearms',
  'extensor-carpi-radialis-longus': 'forearms',
  'extensor-carpi-radialis-brevis': 'forearms',
  'extensor-carpi-ulnaris': 'forearms',
  'extensor-digitorum': 'forearms',
  'flexor-carpi-radialis': 'forearms',
  'palmaris-longus': 'forearms',
  'finger-flexors': 'forearms',
  'pronator-quadratus': 'forearms',
  supinator: 'forearms',
  'external-oblique': 'obliques',
  'serratus-anterior': 'obliques',
  'teres-major': 'lats',
  'rhomboid-major': 'upper-back',
  infraspinatus: 'upper-back',
  'teres-minor': 'upper-back',
  supraspinatus: 'upper-back',
  'erector-spinae': 'lower-back',
  'gluteus-maximus': 'glutes',
  'gluteus-medius': 'glutes',
  'gluteus-minimus': 'glutes',
  'adductor-longus': 'adductors',
  'adductor-brevis': 'adductors',
  'adductor-magnus': 'adductors',
  gracilis: 'adductors',
  quadriceps: 'quads',
  sartorius: 'quads',
  'biceps-femoris': 'hamstrings',
  semitendinosus: 'hamstrings',
  semimembranosus: 'hamstrings',
  gastrocnemius: 'calves',
  soleus: 'calves',
  plantaris: 'calves',
  'tibialis-anterior': 'shins',
  'extensor-digitorum-longus': 'shins',
  'fibularis-longus': 'shins',
  'fibularis-brevis': 'shins',
}

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/models/body.glb')

const packDir = process.argv[2]
if (!packDir) {
  console.error('usage: node scripts/build-body-model.mjs <pack>/package/public')
  process.exit(1)
}

const pack = JSON.parse(readFileSync(join(packDir, 'pack.json'), 'utf8'))
const typeBySlug = new Map(pack.structures.map((s) => [s.id.split(':').pop(), s.type]))
const sideBySelector = new Map(pack.meshInstances.map((i) => [i.selector.value, i.laterality]))

await MeshoptEncoder.ready
await MeshoptSimplifier.ready

const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
})

const out = new Document()
out.createBuffer()
const scene = out.createScene('Body')
const material = out.createMaterial('default')

/** primitives collected per output node name */
const groups = new Map()
/** baked primitives per source structure slug, for landmarks and synthesis */
const bySlug = new Map()
const addTo = (map, key, prim) => {
  if (!map.has(key)) map.set(key, [])
  map.get(key).push(prim)
}

for (const asset of pack.assets) {
  if (/connective/.test(asset.uri)) continue
  const src = await io.read(join(packDir, asset.uri))
  // Copy the source scene into the output document, then bake transforms.
  const map = mergeDocuments(out, src)
  for (const srcNode of src.getRoot().listNodes()) {
    const node = map.get(srcNode)
    if (!node.getMesh()) continue
    const name = srcNode.getName() // e.g. "knee:quadriceps:isa:FJ1433M"
    const slug = name.split(':')[1]
    const type = typeBySlug.get(slug)

    let key
    if (type === 'bone') key = 'bones'
    else if (type === 'muscle') {
      const group = MUSCLE_GROUPS[slug]
      const side = sideBySelector.get(name) ?? (name.endsWith('M') ? 'left' : 'right')
      key = group ? `muscle-${group}-${side === 'left' ? 'l' : side === 'right' ? 'r' : 'c'}` : 'context'
    } else continue

    // Bake the world transform (Z-up millimetres → Y-up metres) into a copy.
    const baked = out.createNode().setMesh(node.getMesh()).setMatrix(node.getWorldMatrix())
    clearNodeTransform(baked)
    for (const prim of baked.getMesh().listPrimitives()) {
      prim.setMaterial(material)
      addTo(groups, key, prim)
      addTo(bySlug, slug, prim)
    }
  }
  // Drop the imported scene graph; only the collected primitives are kept.
  for (const s of out.getRoot().listScenes()) if (s !== scene) s.dispose()
  for (const n of out.getRoot().listNodes()) n.dispose()
}

if (process.env.PROBE) {
  for (const slug of process.env.PROBE.split(',')) {
    const prims = bySlug.get(slug) ?? []
    const lo = [Infinity, Infinity, Infinity]
    const hi = [-Infinity, -Infinity, -Infinity]
    for (const p of prims) {
      const a = p.getAttribute('POSITION').getArray()
      for (let i = 0; i < a.length; i += 3)
        for (let k = 0; k < 3; k++) {
          lo[k] = Math.min(lo[k], a[i + k])
          hi[k] = Math.max(hi[k], a[i + k])
        }
    }
    console.log(slug.padEnd(30), 'min', lo.map((v) => v.toFixed(3)).join(','), 'max', hi.map((v) => v.toFixed(3)).join(','))
  }
  process.exit(0)
}

// Synthesize the muscles BodyParts3D has no mesh for (see lib/synthesize.mjs).
{
  const wrap = [...bySlug]
    .filter(([slug]) => WRAP_SLUGS.some((re) => re.test(slug)))
    .flatMap(([, prims]) => prims.map((p) => p.getAttribute('POSITION').getArray()))
  const radius = buildRadiusField(wrap)
  const toPrim = ({ positions, normals, indices }) =>
    out
      .createPrimitive()
      .setAttribute('POSITION', out.createAccessor().setType('VEC3').setArray(positions))
      .setAttribute('NORMAL', out.createAccessor().setType('VEC3').setArray(normals))
      .setIndices(out.createAccessor().setType('SCALAR').setArray(indices))
      .setMaterial(material)
  const HUMERUS_INSERTION = [0.163, 1.258, 0.082]
  for (const [sign, side] of [[1, 'l'], [-1, 'r']]) {
    addTo(groups, `muscle-lats-${side}`, toPrim(latissimusDorsi(radius, sign, HUMERUS_INSERTION)))
    addTo(groups, `muscle-abs-${side}`, toPrim(rectusAbdominis(radius, sign)))
  }
}

// Sanity check the side convention the app relies on: body's left is +X.
{
  const a = groups.get('muscle-delts-l')[0].getAttribute('POSITION').getArray()
  let sx = 0
  for (let i = 0; i < a.length; i += 3) sx += a[i]
  if (sx <= 0) throw new Error('expected left-side muscles on +X')
}

// One node + mesh per group, with its primitives joined into one draw call.
for (const [key, prims] of groups) {
  const mesh = out.createMesh(key).addPrimitive(joinPrimitives(prims))
  scene.addChild(out.createNode(key).setMesh(mesh))
}

// Recentre: feet on y = 0, figure centred on x/z.
const min = [Infinity, Infinity, Infinity]
const max = [-Infinity, -Infinity, -Infinity]
for (const node of scene.listChildren()) {
  const pos = node.getMesh().listPrimitives()[0].getAttribute('POSITION')
  const lo = pos.getMin([])
  const hi = pos.getMax([])
  for (let i = 0; i < 3; i++) {
    min[i] = Math.min(min[i], lo[i])
    max[i] = Math.max(max[i], hi[i])
  }
}
const offset = [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2]
for (const node of scene.listChildren()) {
  node.setTranslation(offset)
  clearNodeTransform(node)
}
console.log('bounds (m):', min.map((v, i) => +(max[i] - v).toFixed(3)))

// Triangle budgets per node. Bones and the dense abdominal/forearm meshes
// dominate the source; selectable muscles keep the most detail.
const BUDGET = { bones: 70_000, context: 9_000, default: 7_000 }
const budgetFor = (name) =>
  name === 'bones' ? BUDGET.bones : name === 'context' ? BUDGET.context : BUDGET.default

await out.transform(unpartition(), prune(), dedup(), weld())
let total = 0
for (const node of scene.listChildren()) {
  const prim = node.getMesh().listPrimitives()[0]
  const tris = prim.getIndices().getCount() / 3
  const target = budgetFor(node.getName())
  if (tris > target) simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio: target / tris, error: 0.01 })
  total += prim.getIndices().getCount() / 3
}
console.log('triangles:', Math.round(total))
await out.transform(prune(), quantize())
out.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({
  method: EXTMeshoptCompression.EncoderMethod.FILTER,
})

mkdirSync(dirname(OUT), { recursive: true })
await io.write(OUT, out)

const keys = [...groups.keys()].sort()
console.log(`wrote ${OUT} (${(statSync(OUT).size / 1e6).toFixed(2)} MB), ${keys.length} nodes:`)
console.log(keys.join(' '))
