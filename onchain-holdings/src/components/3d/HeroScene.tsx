"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Float, Loader, useGLTF } from "@react-three/drei";
import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import { FloatingObject } from "./FloatingObject";
import { useWindowSize } from "@/hooks/useWindowSize";

const HERO_MODEL_PATH = "/models/hero-character.glb";
const DRACO_DECODER_PATH = "/draco/";

type SceneProps = {
  useModel: boolean;
};

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Hero model failed to load; rendering procedural fallback.", error, errorInfo);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function HeroModel() {
  const gltf = useGLTF(HERO_MODEL_PATH, DRACO_DECODER_PATH);

  return <primitive object={gltf.scene} scale={2.15} position={[0, -0.45, 0]} rotation={[0, -0.24, 0]} />;
}

function ProceduralHero() {
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
      <FloatingObject />
    </Float>
  );
}

function Scene({ useModel }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <SceneErrorBoundary fallback={<ProceduralHero />}>
        {useModel ? (
          <Float speed={0.65} rotationIntensity={0.08} floatIntensity={0.28}>
            <HeroModel />
          </Float>
        ) : (
          <ProceduralHero />
        )}
      </SceneErrorBoundary>
      <Environment preset="studio" />
    </>
  );
}

if (process.env.NEXT_PUBLIC_ENABLE_HERO_MODEL === "true") {
  useGLTF.preload(HERO_MODEL_PATH, DRACO_DECODER_PATH);
}

export function HeroScene() {
  const { width } = useWindowSize();
  const mobile = width > 0 && width < 768;
  const useProductionModel = process.env.NEXT_PUBLIC_ENABLE_HERO_MODEL === "true";

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
          <Scene useModel={useProductionModel} />
        </Canvas>
      </Suspense>
      <Loader containerStyles={{ background: "transparent" }} innerStyles={{ background: "#454c5e" }} barStyles={{ background: "#ffffff" }} />
    </div>
  );
}
