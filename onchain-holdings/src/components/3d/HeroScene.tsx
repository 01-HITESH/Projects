"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Float, Loader } from "@react-three/drei";
import { Suspense } from "react";
import { FloatingObject } from "./FloatingObject";
import { useWindowSize } from "@/hooks/useWindowSize";

function Scene() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
        <FloatingObject />
      </Float>
      <Environment preset="studio" />
    </>
  );
}

export function HeroScene() {
  const { width } = useWindowSize();
  const mobile = width > 0 && width < 768;

  if (mobile) {
    return (
      <div className="absolute inset-0 grid place-items-center" aria-label="Interactive 3D brand visualization" role="img">
        <div className="h-72 w-72 rounded-full border border-border bg-surface shadow-2xl" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0" aria-label="Interactive 3D brand visualization" role="img">
      <Suspense fallback={<div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-surface" />}>
        <Canvas camera={{ position: [0, 0, 5], fov: 38 }} dpr={[1, 1.5]}>
          <Scene />
        </Canvas>
      </Suspense>
      <Loader containerStyles={{ background: "transparent" }} innerStyles={{ background: "#454c5e" }} barStyles={{ background: "#ffffff" }} />
    </div>
  );
}
