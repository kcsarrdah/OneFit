import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { AdditiveBlending, DoubleSide, type Group } from 'three'

const ACCENT = '#2ee6c5'

/**
 * Character-select style pedestal. Its top surface sits exactly at y = 0,
 * which is where the model's feet are placed by the build script.
 */
export function Platform() {
  const rings = useRef<Group>(null)

  useFrame((_, delta) => {
    // The group is laid flat (rotated on X), so its local Z is world up.
    if (rings.current) rings.current.rotation.z += delta * 0.25
  })

  return (
    <group>
      {/* pedestal body */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.62, 0.66, 0.08, 96]} />
        <meshStandardMaterial color="#0f1628" roughness={0.35} metalness={0.6} />
      </mesh>
      {/* glowing rim */}
      <mesh position={[0, -0.001, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.6, 0.625, 128]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
      {/* rotating inner rings */}
      <group ref={rings} position={[0, 0.002, 0]} rotation-x={-Math.PI / 2}>
        <mesh>
          <ringGeometry args={[0.44, 0.447, 128, 1, 0, Math.PI * 1.4]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.55} toneMapped={false} side={DoubleSide} />
        </mesh>
        <mesh rotation-z={Math.PI}>
          <ringGeometry args={[0.5, 0.504, 128, 1, 0, Math.PI * 0.6]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.35} toneMapped={false} side={DoubleSide} />
        </mesh>
      </group>
      {/* soft light pool under the figure */}
      <mesh position={[0, 0.003, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.6, 64]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.06} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
