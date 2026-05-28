"use client";

import { ContactShadows, Environment, Float, OrbitControls, RoundedBox, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import type { Group } from "three";

export function LoginHeroScene() {
  return (
    <div className="absolute inset-0">
      <div aria-hidden="true" className="login-scene-fallback">
        <div className="login-room-wall" />
        <div className="login-room-left-wall" />
        <div className="login-room-floor" />
        <div className="login-window login-window-a" />
        <div className="login-window login-window-b" />
        <div className="login-wall-art" />
        <div className="login-sofa">
          <span />
          <span />
        </div>
        <div className="login-table" />
        <div className="login-chair" />
        <div className="login-rug" />
      </div>
      <Canvas camera={{ fov: 42, position: [5.2, 3.3, 5.4] }} dpr={[1, 1.75]} shadows>
        <Suspense fallback={null}>
          <color args={["#d9e3df"]} attach="background" />
          <fog args={["#d9e3df", 8, 15]} attach="fog" />
          <ambientLight intensity={0.54} />
          <directionalLight
            castShadow
            intensity={1.25}
            position={[3.5, 5.2, 4.2]}
            shadow-mapSize-height={1024}
            shadow-mapSize-width={1024}
          />
          <pointLight color="#ffe8b8" intensity={1.4} position={[-1.7, 2.3, -1.4]} />
          <RoomSet />
          <Environment preset="apartment" />
          <ContactShadows blur={2.4} far={7} opacity={0.24} position={[0, 0.012, 0]} resolution={1024} scale={8} />
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.45}
            enableDamping
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI / 2.15}
            minPolarAngle={Math.PI / 3.2}
            target={[0, 1.05, 0]}
          />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(23,24,22,0.02),rgba(23,24,22,0.18)_66%,rgba(23,24,22,0.34))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ink/58 to-transparent" />
    </div>
  );
}

function RoomSet() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.28) * 0.035;
  });

  return (
    <group ref={groupRef} position={[-0.25, -0.04, 0]}>
      <RoomShell />
      <Sofa />
      <CoffeeTable />
      <MediaWall />
      <AccentChair />
      <FloorLamp />
      <WallArt />
      <Float floatIntensity={0.18} rotationIntensity={0.08} speed={1.15}>
        <Text
          anchorX="center"
          anchorY="middle"
          color="#fbfcf8"
          fontSize={0.16}
          maxWidth={1.5}
          position={[1.55, 1.92, -2.02]}
          rotation={[0, -0.08, 0]}
        >
          AI concept to 360 room
        </Text>
      </Float>
    </group>
  );
}

function RoomShell() {
  return (
    <group>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[5.8, 0.06, 5.2]} />
        <meshStandardMaterial color="#9fb0a5" roughness={0.66} />
      </mesh>
      <mesh position={[0, 1.42, -2.6]} receiveShadow>
        <boxGeometry args={[5.8, 2.9, 0.08]} />
        <meshStandardMaterial color="#eef0e8" roughness={0.92} />
      </mesh>
      <mesh position={[-2.9, 1.42, 0]} receiveShadow>
        <boxGeometry args={[0.08, 2.9, 5.2]} />
        <meshStandardMaterial color="#e5ebe5" roughness={0.9} />
      </mesh>
      <mesh position={[2.9, 1.42, 0]} receiveShadow>
        <boxGeometry args={[0.08, 2.9, 5.2]} />
        <meshStandardMaterial color="#dfe6e2" roughness={0.9} />
      </mesh>
      <RoundedBox args={[1.25, 1.35, 0.06]} position={[-1.55, 1.55, -2.54]} radius={0.035}>
        <meshStandardMaterial color="#8fb1bd" emissive="#8fb1bd" emissiveIntensity={0.18} roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[1.25, 1.35, 0.06]} position={[0.05, 1.55, -2.54]} radius={0.035}>
        <meshStandardMaterial color="#cbd8d2" roughness={0.72} />
      </RoundedBox>
      <mesh position={[1.65, 0.01, 0.7]} receiveShadow rotation={[0, 0.35, 0]}>
        <boxGeometry args={[1.55, 0.025, 1.05]} />
        <meshStandardMaterial color="#c2a44f" roughness={0.78} />
      </mesh>
    </group>
  );
}

function Sofa() {
  return (
    <group position={[-0.82, 0, -1.42]}>
      <RoundedBox args={[2.55, 0.36, 0.9]} castShadow position={[0, 0.32, 0.1]} radius={0.09}>
        <meshStandardMaterial color="#405664" roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[2.65, 0.82, 0.18]} castShadow position={[0, 0.72, -0.38]} radius={0.08}>
        <meshStandardMaterial color="#334750" roughness={0.84} />
      </RoundedBox>
      <RoundedBox args={[0.22, 0.62, 0.88]} castShadow position={[-1.42, 0.54, 0.05]} radius={0.07}>
        <meshStandardMaterial color="#405664" roughness={0.84} />
      </RoundedBox>
      <RoundedBox args={[0.22, 0.62, 0.88]} castShadow position={[1.42, 0.54, 0.05]} radius={0.07}>
        <meshStandardMaterial color="#405664" roughness={0.84} />
      </RoundedBox>
      <RoundedBox args={[0.48, 0.27, 0.12]} castShadow position={[-0.62, 0.75, -0.17]} radius={0.06}>
        <meshStandardMaterial color="#fbfcf8" roughness={0.88} />
      </RoundedBox>
      <RoundedBox args={[0.48, 0.27, 0.12]} castShadow position={[0.6, 0.75, -0.17]} radius={0.06}>
        <meshStandardMaterial color="#b36b55" roughness={0.86} />
      </RoundedBox>
    </group>
  );
}

function CoffeeTable() {
  return (
    <group position={[-0.45, 0, -0.15]}>
      <RoundedBox args={[1.18, 0.08, 0.7]} castShadow position={[0, 0.39, 0]} radius={0.045}>
        <meshStandardMaterial color="#e2ddd2" roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.36, 0.48]} castShadow position={[-0.38, 0.2, 0]} radius={0.025}>
        <meshStandardMaterial color="#8a6b4d" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.36, 0.48]} castShadow position={[0.38, 0.2, 0]} radius={0.025}>
        <meshStandardMaterial color="#8a6b4d" roughness={0.55} />
      </RoundedBox>
    </group>
  );
}

function MediaWall() {
  return (
    <group position={[0.45, 0, 2.18]}>
      <RoundedBox args={[1.95, 0.5, 0.32]} castShadow position={[0, 0.32, 0]} radius={0.04}>
        <meshStandardMaterial color="#8a6b4d" roughness={0.56} />
      </RoundedBox>
      <RoundedBox args={[1.42, 0.82, 0.06]} castShadow position={[0, 1.12, -0.16]} radius={0.025}>
        <meshStandardMaterial color="#141816" metalness={0.1} roughness={0.42} />
      </RoundedBox>
      <mesh position={[0, 1.13, -0.125]}>
        <boxGeometry args={[1.22, 0.58, 0.01]} />
        <meshStandardMaterial color="#5f7f72" emissive="#5f7f72" emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
    </group>
  );
}

function AccentChair() {
  return (
    <group position={[1.62, 0, 0.02]} rotation={[0, -0.55, 0]}>
      <RoundedBox args={[0.76, 0.18, 0.66]} castShadow position={[0, 0.42, 0.05]} radius={0.06}>
        <meshStandardMaterial color="#b36b55" roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.62, 0.13]} castShadow position={[0, 0.82, -0.26]} radius={0.06}>
        <meshStandardMaterial color="#b36b55" roughness={0.82} />
      </RoundedBox>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.28, 0.34, 0.2, 32]} />
        <meshStandardMaterial color="#202826" metalness={0.28} roughness={0.48} />
      </mesh>
    </group>
  );
}

function FloorLamp() {
  return (
    <group position={[-2.1, 0, -1.15]}>
      <mesh castShadow position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.65, 24]} />
        <meshStandardMaterial color="#202826" metalness={0.35} roughness={0.48} />
      </mesh>
      <mesh castShadow position={[0, 1.75, 0]}>
        <cylinderGeometry args={[0.23, 0.32, 0.38, 32]} />
        <meshStandardMaterial color="#fff2cb" emissive="#ffc86b" emissiveIntensity={0.35} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 32]} />
        <meshStandardMaterial color="#202826" metalness={0.35} roughness={0.48} />
      </mesh>
    </group>
  );
}

function WallArt() {
  return (
    <group position={[1.72, 1.45, -2.53]}>
      <RoundedBox args={[0.78, 0.9, 0.06]} radius={0.025}>
        <meshStandardMaterial color="#fbfcf8" roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.55, 0.07]} position={[0, 0.02, 0.02]} radius={0.02}>
        <meshStandardMaterial color="#5f7f72" roughness={0.75} />
      </RoundedBox>
    </group>
  );
}
