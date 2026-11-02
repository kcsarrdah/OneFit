import {
  AdditiveBlending,
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type IUniform,
  type WebGLProgramParametersWithUniforms,
} from 'three'

import type { BodyStyle } from './styles'

export type { BodyStyle } from './styles'

/** Uniforms shared by every material on the figure. */
export interface SharedUniforms {
  /** World Y above which the figure is not drawn yet (intro reveal). */
  uReveal: IUniform<number>
  uEdgeColor: IUniform<Color>
  /** Metres to push muscle surfaces out along their normals (weight). */
  uInflate: IUniform<number>
  /** Forward abdominal bulge in metres (high BMI). */
  uBelly: IUniform<number>
  /** 0..1 desaturation of muscle colour (age). */
  uDesat: IUniform<number>
  /** 0..1 depth of muscle separations (low body fat). */
  uDefinition: IUniform<number>
  /** 0..1 soft, matte fat layer (high body fat). */
  uSoftness: IUniform<number>
}

/** Per-material uniforms driven by selection and hover. */
export interface MaterialUniforms {
  /** World Y of the selection light sweep. */
  uSweep: IUniform<number>
  uSweepAmount: IUniform<number>
  uSweepColor: IUniform<Color>
  /** Fresnel rim glow strength. */
  uRim: IUniform<number>
  uRimColor: IUniform<Color>
  /** How much uInflate/uBelly apply to this material (0 for bones). */
  uShape: IUniform<number>
  /** How much body-fat definition/softness applies (0 for bones). */
  uComposition: IUniform<number>
}

export function createSharedUniforms(): SharedUniforms {
  return {
    uReveal: { value: -1 },
    uEdgeColor: { value: new Color('#2ee6c5') },
    uInflate: { value: 0 },
    uBelly: { value: 0 },
    uDesat: { value: 0 },
    uDefinition: { value: 0 },
    uSoftness: { value: 0 },
  }
}

const VERTEX_HEAD = /* glsl */ `
uniform float uInflate;
uniform float uBelly;
uniform float uShape;
uniform float uSoftness;
attribute float _ao;
attribute float _fill;
attribute vec3 _fnormal;
varying vec3 vBodyPos;
varying float vOpen;
varying float vFilled;
varying vec3 vFilledNormal;
`

// After skinning, `transformed` is in metres in the figure's space and
// `objectNormal` is the skinned normal.
const VERTEX_SHAPE = /* glsl */ `
#include <skinning_vertex>
{
  vec3 d = (transformed - vec3(0.0, 1.0, 0.03)) / vec3(0.17, 0.15, 0.16);
  float belly = uBelly * exp(-dot(d, d)) * smoothstep(-0.06, 0.06, transformed.z);
  // Fat fills the six-pack grooves (_fill: groove depth, in cm) first.
  float fat = smoothstep(0.0, 0.6, uSoftness);
  float fill = _fill * 0.01 * fat;
  vFilled = clamp(_fill * 12.0, 0.0, 1.0) * fat;
  // Normal of the groove-free surface (only present on the abs).
  vec3 fn = _fnormal;
  #ifdef USE_SKINNING
    fn = (skinMatrix * vec4(fn, 0.0)).xyz;
  #endif
  vFilledNormal = dot(fn, fn) > 1e-6 ? normalize(normalMatrix * fn) : vec3(0.0, 0.0, 1.0);
  transformed += normalize(objectNormal) * (uInflate + belly + fill) * uShape;
  vBodyPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vOpen = _ao;
}
`

const FRAGMENT_HEAD = /* glsl */ `
uniform float uReveal;
uniform vec3 uEdgeColor;
uniform float uDesat;
uniform float uSweep;
uniform float uSweepAmount;
uniform vec3 uSweepColor;
uniform float uRim;
uniform vec3 uRimColor;
uniform float uDefinition;
uniform float uSoftness;
uniform float uComposition;
varying vec3 vBodyPos;
varying float vOpen;
varying float vFilled;
varying vec3 vFilledNormal;
`

const FRAGMENT_REVEAL = /* glsl */ `
#include <clipping_planes_fragment>
if (vBodyPos.y > uReveal) discard;
`

// Body composition: _AO (baked crevice openness, 1 = open) darkens the
// grooves between muscles. Lean bodies get deep, sharp separations; fat
// fills them in and the surface turns softer and lighter.
const FRAGMENT_COLOR = /* glsl */ `
#include <color_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114))), uDesat);
{
  float groove = smoothstep(0.12, 0.8, 1.0 - vOpen);
  float depth = mix(0.3, 0.88, uDefinition) * (1.0 - 0.75 * uSoftness);
  diffuseColor.rgb *= 1.0 - groove * depth * uComposition;
  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.12 + 0.02, uSoftness * 0.35 * uComposition);
}
`

// Where fat has filled a groove, shade with the groove-free surface's
// normal (baked into the abs) instead of the groove's own.
const FRAGMENT_NORMAL = /* glsl */ `
#include <normal_fragment_maps>
if (vFilled > 0.001) {
  vec3 fn = normalize(vFilledNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  normal = normalize(mix(normal, fn, vFilled));
}
`

const FRAGMENT_ROUGHNESS = /* glsl */ `
#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor - 0.14 * uDefinition * uComposition + 0.25 * uSoftness * uComposition, 0.05, 1.0);
`

const FRAGMENT_GLOW = /* glsl */ `
#include <emissivemap_fragment>
{
  float edge = 1.0 - smoothstep(0.0, 0.045, uReveal - vBodyPos.y);
  totalEmissiveRadiance += uEdgeColor * edge * 3.0;
  float band = exp(-pow((vBodyPos.y - uSweep) / 0.04, 2.0));
  totalEmissiveRadiance += uSweepColor * band * uSweepAmount;
  float rim = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.4);
  totalEmissiveRadiance += uRimColor * rim * uRim;
}
`

/** Adds the figure's shared shader effects to a standard/physical material. */
function patch<M extends MeshStandardMaterial>(material: M, shared: SharedUniforms, shape: number): M & { userData: { u: MaterialUniforms } } {
  const own: MaterialUniforms = {
    uSweep: { value: -10 },
    uSweepAmount: { value: 0 },
    uSweepColor: { value: new Color('#bffff3') },
    uRim: { value: 0 },
    uRimColor: { value: new Color('#ff8a7a') },
    uShape: { value: shape },
    uComposition: { value: shape > 0 ? 1 : 0 },
  }
  material.userData.u = own
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, shared, own)
    shader.vertexShader = VERTEX_HEAD + shader.vertexShader.replace('#include <skinning_vertex>', VERTEX_SHAPE)
    shader.fragmentShader =
      FRAGMENT_HEAD +
      shader.fragmentShader
        .replace('#include <clipping_planes_fragment>', FRAGMENT_REVEAL)
        .replace('#include <color_fragment>', FRAGMENT_COLOR)
        .replace('#include <roughnessmap_fragment>', FRAGMENT_ROUGHNESS)
        .replace('#include <normal_fragment_maps>', FRAGMENT_NORMAL)
        .replace('#include <emissivemap_fragment>', FRAGMENT_GLOW)
  }
  // All figure materials share one program per material type.
  material.customProgramCacheKey = () => 'onefit-body'
  return material as M & { userData: { u: MaterialUniforms } }
}

export type FigureMaterial = (MeshStandardMaterial | MeshPhysicalMaterial) & { userData: { u: MaterialUniforms } }

export interface StylePalette {
  muscle: Color
  dim: Color
  /** Non-selectable muscles. */
  context: Color
  hover: Color
  selected: Color
  selectedEmissive: Color
  hoverEmissive: Color
  hoverRim: number
  /** Desaturation from age is applied on top of these colours. */
  desaturates: boolean
}

const BASE_PALETTES: Record<BodyStyle, StylePalette> = {
  hologram: {
    muscle: new Color('#9a2c35'),
    // Muscles fade to a dark, greyed red while another is selected, so any
    // theme accent stands out (including red ones).
    dim: new Color('#3e2a2d'),
    context: new Color('#5c2028'),
    hover: new Color('#d4505d'),
    selected: new Color('#34e0c4'),
    selectedEmissive: new Color('#0d8f7c'),
    hoverEmissive: new Color('#4a0d14'),
    hoverRim: 0.9,
    desaturates: true,
  },
  anatomical: {
    muscle: new Color('#8f2b33'),
    dim: new Color('#45292c'),
    context: new Color('#5a2128'),
    hover: new Color('#d0505c'),
    selected: new Color('#34e0c4'),
    selectedEmissive: new Color('#0d8f7c'),
    hoverEmissive: new Color('#5a1018'),
    hoverRim: 0.7,
    desaturates: true,
  },
  sculpt: {
    muscle: new Color('#b9c0cf'),
    dim: new Color('#8a92a6'),
    context: new Color('#8a92a6'),
    hover: new Color('#e3e8f2'),
    selected: new Color('#ff6a4d'),
    selectedEmissive: new Color('#8a1e0c'),
    hoverEmissive: new Color('#1c2233'),
    hoverRim: 0.6,
    desaturates: false,
  },
}

/** A look's palette, with selection in the theme's accent colour. */
export function paletteFor(style: BodyStyle, accent: string, accentDeep: string): StylePalette {
  return { ...BASE_PALETTES[style], selected: new Color(accent), selectedEmissive: new Color(accentDeep) }
}

export function createMuscleMaterial(style: BodyStyle, shared: SharedUniforms): FigureMaterial {
  const p = BASE_PALETTES[style]
  const m = new MeshPhysicalMaterial({
    color: p.muscle.clone(),
    emissive: new Color('#000000'),
    roughness: style === 'sculpt' ? 0.55 : 0.42,
    // Clearcoat gives the wet sheen of muscle tissue.
    clearcoat: style === 'sculpt' ? 0.1 : 0.35,
    clearcoatRoughness: 0.35,
  })
  const f = patch(m, shared, 1)
  f.userData.u.uRimColor.value.copy(style === 'sculpt' ? new Color('#9fb4ff') : new Color('#ff8a7a'))
  return f
}

export function createContextMaterial(style: BodyStyle, shared: SharedUniforms): FigureMaterial {
  const p = BASE_PALETTES[style]
  return patch(
    new MeshPhysicalMaterial({ color: p.context.clone(), roughness: 0.5, clearcoat: 0.2, clearcoatRoughness: 0.5 }),
    shared,
    1,
  )
}

export function createBoneMaterial(style: BodyStyle, shared: SharedUniforms, accent: string): FigureMaterial {
  if (style === 'hologram') {
    // X-ray bone: dark, additive, lit only by a fresnel rim, so the
    // skeleton reads as a glowing outline rather than a solid skull.
    const m = patch(
      new MeshStandardMaterial({
        color: '#000000',
        emissive: new Color(accent).multiplyScalar(0.18),
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
      shared,
      0,
    )
    m.userData.u.uRim.value = 1.6
    m.userData.u.uRimColor.value.set(accent)
    return m
  }
  if (style === 'sculpt') {
    return patch(new MeshStandardMaterial({ color: '#7d8599', roughness: 0.6 }), shared, 0)
  }
  return patch(new MeshStandardMaterial({ color: '#e9dcc3', roughness: 0.62 }), shared, 0)
}

/**
 * The sculpted head that stands in for the skull: a sleek dark shell with a
 * glowing rim (hologram), a muscle-toned sculpture (anatomy), or the same
 * clay as the rest of the figure (sculpt).
 */
export function createHeadMaterial(style: BodyStyle, shared: SharedUniforms, accent: string): FigureMaterial {
  if (style === 'hologram') {
    const m = patch(
      new MeshPhysicalMaterial({ color: '#2a2226', roughness: 0.5, clearcoat: 0.4, clearcoatRoughness: 0.4 }),
      shared,
      0.5,
    )
    m.userData.u.uRim.value = 0.55
    m.userData.u.uRimColor.value.set(accent)
    return m
  }
  if (style === 'sculpt') {
    return patch(new MeshPhysicalMaterial({ color: '#b9c0cf', roughness: 0.55, clearcoat: 0.1 }), shared, 0.5)
  }
  const m = patch(
    new MeshPhysicalMaterial({ color: '#6b2c32', roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.4 }),
    shared,
    0.5,
  )
  m.userData.u.uRim.value = 0.25
  return m
}
