"use client";

import {
  ContactShadows,
  Environment,
  Grid,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
} from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Box, Lightbulb, Save, Sun } from "lucide-react";

import type {
  FurniturePrimitive,
  PrimitivePart,
  SceneDocument,
  SurfacePrimitive,
} from "@/types/project";

type SceneViewerProps = {
  scene: SceneDocument | null;
  selectedFurnitureId: string | null;
  saving: boolean;
  onSelectFurniture: (id: string | null) => void;
  onUpdateScene: (updater: (scene: SceneDocument) => SceneDocument) => void;
  onSave: () => Promise<void>;
};

const finishes = ["#f3f0e8", "#9aa58f", "#a96f55", "#c4a35a", "#303433"];

export function SceneViewer({
  scene,
  selectedFurnitureId,
  saving,
  onSelectFurniture,
  onUpdateScene,
  onSave,
}: SceneViewerProps) {
  const selected = scene?.furniture.find((item) => item.id === selectedFurnitureId) ?? null;

  if (!scene) {
    return (
      <section className="panel flex min-h-[560px] items-center justify-center rounded-lg p-6 text-center">
        <div>
          <p className="text-sm font-medium text-steel">Step 3</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">360 room model pending</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink/60">
            Select a redesign concept and generate the 360 room to explore and customize the interior.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="relative min-h-[620px] overflow-hidden rounded-lg border border-ink/10 bg-[#dfe3dd] shadow-soft">
        <Canvas dpr={[1, 1.75]} shadows>
          <PerspectiveCamera makeDefault fov={45} position={[5.3, 3.3, 5.6]} />
          <color args={["#dfe3dd"]} attach="background" />
          <fog args={["#dfe3dd", 8, 15]} attach="fog" />
          <ambientLight intensity={scene.lighting.ambient} />
          <directionalLight
            castShadow
            intensity={scene.lighting.key}
            position={[3.8, 5.4, 4.4]}
            shadow-mapSize-height={2048}
            shadow-mapSize-width={2048}
          />
          <directionalLight color="#d7e2ff" intensity={0.28} position={[-4, 2.8, -2.4]} />
          <pointLight color="#fff1d0" intensity={0.72} position={[0, scene.dimensions.height - 0.35, 0.2]} />

          <group>
            {scene.surfaces.map((surface) => (
              <SurfaceMesh key={surface.id} surface={surface} />
            ))}
            {scene.furniture.map((item) => (
              <FurnitureGroup
                item={item}
                key={item.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectFurniture(item.id);
                }}
              />
            ))}
          </group>

          <ContactShadows
            blur={2.8}
            far={7}
            opacity={0.24}
            position={[0, 0.012, 0]}
            resolution={1024}
            scale={9}
          />
          <Grid
            args={[scene.dimensions.width + 1, scene.dimensions.depth + 1]}
            cellColor="#a9afa8"
            cellSize={0.5}
            fadeDistance={10}
            position={[0, 0.006, 0]}
            sectionColor="#748475"
            sectionSize={1}
          />
          <Environment preset="apartment" />
          <OrbitControls enableDamping maxPolarAngle={Math.PI / 2.08} target={[0, 1.1, 0]} />
        </Canvas>
        <div className="absolute left-4 top-4 rounded-lg border border-ink/10 bg-chalk/90 px-3 py-2 text-sm shadow-soft backdrop-blur">
          360 walkthrough - {scene.theme}
        </div>
      </div>

      <aside className="panel flex flex-col gap-4 rounded-lg p-4">
        <div>
          <p className="text-sm font-medium text-steel">Customize</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">Live controls</h2>
        </div>

        <div className="space-y-2">
          {scene.furniture.map((item) => (
            <button
              className={[
                "focus-ring flex min-h-11 w-full items-center justify-between rounded-lg border px-3 text-left text-sm transition",
                selectedFurnitureId === item.id
                  ? "border-ink bg-ink text-chalk"
                  : "border-ink/10 bg-chalk text-ink hover:border-steel",
              ].join(" ")}
              key={item.id}
              type="button"
              onClick={() => onSelectFurniture(item.id)}
            >
              <span className="inline-flex items-center gap-2">
                <Box className="h-4 w-4" />
                {item.name}
              </span>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="space-y-3 rounded-lg border border-ink/10 bg-chalk p-3">
            <p className="text-sm font-semibold">{selected.name}</p>
            <div className="grid grid-cols-5 gap-2">
              {finishes.map((color) => (
                <button
                  aria-label={`Apply ${color}`}
                  className="focus-ring h-9 rounded-lg border border-ink/12"
                  key={color}
                  style={{ backgroundColor: color }}
                  type="button"
                  onClick={() =>
                    updateFurniture(scene, selected.id, onUpdateScene, (item) => ({
                      ...item,
                      material: { ...item.material, color },
                      parts: item.parts.map((part) => ({
                        ...part,
                        material:
                          part.material.metalness > 0.2
                            ? part.material
                            : { ...part.material, color },
                      })),
                    }))
                  }
                />
              ))}
            </div>
            <button
              className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-ink/10 bg-chalk text-sm font-medium hover:bg-ink hover:text-chalk"
              type="button"
              onClick={() =>
                updateFurniture(scene, selected.id, onUpdateScene, (item) => ({
                  ...item,
                  rotation: [item.rotation[0], item.rotation[1] + Math.PI / 12, item.rotation[2]],
                }))
              }
            >
              <Sun className="h-4 w-4" />
              Rotate object
            </button>
          </div>
        ) : null}

        <button
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-ink/10 bg-chalk text-sm font-medium hover:bg-ink hover:text-chalk"
          type="button"
          onClick={() =>
            onUpdateScene((current) => ({
              ...current,
              lighting: {
                ...current.lighting,
                key: current.lighting.key >= 1.3 ? 0.85 : current.lighting.key + 0.15,
              },
            }))
          }
        >
          <Lightbulb className="h-4 w-4" />
          Adjust lighting
        </button>

        <button
          className="focus-ring mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-chalk hover:bg-steel disabled:bg-ink/35"
          disabled={saving}
          type="button"
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Save design
        </button>
      </aside>
    </section>
  );
}

function SurfaceMesh({ surface }: { surface: SurfacePrimitive }) {
  return (
    <mesh position={surface.position} receiveShadow scale={surface.size}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={surface.material.color}
        metalness={surface.material.metalness}
        roughness={surface.material.roughness}
      />
    </mesh>
  );
}

function FurnitureGroup({
  item,
  onClick,
}: {
  item: FurniturePrimitive;
  onClick: (event: ThreeEvent<MouseEvent>) => void;
}) {
  const parts = item.parts.length
    ? item.parts
    : [
        {
          id: `${item.id}-body`,
          shape: "box" as const,
          position: [0, item.dimensions[1] / 2, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          dimensions: item.dimensions,
          material: item.material,
        },
      ];

  return (
    <group onClick={onClick} position={item.position} rotation={item.rotation}>
      {parts.map((part) => (
        <PartMesh key={`${item.id}-${part.id}`} part={part} />
      ))}
    </group>
  );
}

function PartMesh({ part }: { part: PrimitivePart }) {
  if (part.shape === "cylinder") {
    return (
      <mesh castShadow position={part.position} receiveShadow rotation={part.rotation} scale={part.dimensions}>
        <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        <PartMaterial part={part} />
      </mesh>
    );
  }

  if (part.shape === "sphere") {
    return (
      <mesh castShadow position={part.position} receiveShadow rotation={part.rotation} scale={part.dimensions}>
        <sphereGeometry args={[0.5, 32, 16]} />
        <PartMaterial part={part} />
      </mesh>
    );
  }

  const radius = Math.min(0.08, Math.max(0.015, Math.min(...part.dimensions) * 0.18));
  return (
    <RoundedBox
      args={[part.dimensions[0], part.dimensions[1], part.dimensions[2]]}
      castShadow
      position={part.position}
      radius={radius}
      receiveShadow
      rotation={part.rotation}
      smoothness={3}
    >
      <PartMaterial part={part} />
    </RoundedBox>
  );
}

function PartMaterial({ part }: { part: PrimitivePart }) {
  return (
    <meshStandardMaterial
      color={part.material.color}
      metalness={part.material.metalness}
      roughness={part.material.roughness}
    />
  );
}

function updateFurniture(
  scene: SceneDocument,
  id: string,
  onUpdateScene: (updater: (scene: SceneDocument) => SceneDocument) => void,
  updater: (item: FurniturePrimitive) => FurniturePrimitive,
) {
  onUpdateScene(() => ({
    ...scene,
    furniture: scene.furniture.map((item) => (item.id === id ? updater(item) : item)),
  }));
}
