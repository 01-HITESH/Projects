"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

export function FloatingObject() {
  const group = useRef<Group>(null);

  useFrame(({ mouse }) => {
    if (!group.current) return;
    group.current.rotation.y += 0.003;
    group.current.rotation.x += (mouse.y * 0.15 - group.current.rotation.x) * 0.04;
    group.current.rotation.z += (mouse.x * 0.08 - group.current.rotation.z) * 0.04;
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshStandardMaterial color="#b6bac5" roughness={0.42} metalness={0.08} />
      </mesh>
      <mesh position={[-0.42, 0.34, 0.96]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color="#1e2330" roughness={0.35} />
      </mesh>
      <mesh position={[0.42, 0.34, 0.96]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color="#1e2330" roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.12, 1.05]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[-0.82, -0.8, 0.2]} rotation={[0.2, 0.1, 0.5]}>
        <capsuleGeometry args={[0.18, 0.72, 12, 24]} />
        <meshStandardMaterial color="#383e4e" roughness={0.5} />
      </mesh>
      <mesh position={[0.82, -0.8, 0.2]} rotation={[0.2, -0.1, -0.5]}>
        <capsuleGeometry args={[0.18, 0.72, 12, 24]} />
        <meshStandardMaterial color="#383e4e" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.95, 0]}>
        <sphereGeometry args={[0.78, 32, 32]} />
        <meshStandardMaterial color="#2c3140" roughness={0.45} />
      </mesh>
    </group>
  );
}
