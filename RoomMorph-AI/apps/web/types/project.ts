export type Vector3Tuple = [number, number, number];

export type Asset = {
  id: string;
  type: "source" | "concept" | "depth" | "glb";
  url: string;
  width?: number | null;
  height?: number | null;
};

export type DesignBrief = {
  roomType: string;
  themes: string[];
  palette: string[];
  constraints: string;
  budgetRange: string;
  lifestyle: string;
  priority: string;
};

export type ScoreBreakdown = {
  styleMatch: number;
  feasibility: number;
  budgetFit: number;
  maintainability: number;
  sustainability: number;
};

export type BudgetEstimate = {
  rangeLabel: string;
  minInr: number;
  maxInr: number;
  timelineWeeks: number;
  confidence: number;
  notes: string[];
};

export type MaterialPlanItem = {
  item: string;
  material: string;
  finish: string;
  durability: string;
  care: string;
};

export type DesignConcept = {
  id: string;
  projectId: string;
  theme: string;
  title: string;
  rationale: string;
  previewUrl: string;
  palette: string[];
  score: number;
  scoreBreakdown: ScoreBreakdown;
  budget: BudgetEstimate;
  highlights: string[];
  tradeoffs: string[];
  materialPlan: MaterialPlanItem[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
};

export type MaterialSpec = {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
};

export type SurfacePrimitive = {
  id: string;
  type: "floor" | "wall" | "ceiling";
  position: Vector3Tuple;
  size: Vector3Tuple;
  material: MaterialSpec;
};

export type PrimitivePart = {
  id: string;
  shape: "box" | "cylinder" | "sphere";
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  dimensions: Vector3Tuple;
  material: MaterialSpec;
};

export type FurniturePrimitive = {
  id: string;
  kind: string;
  name: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  dimensions: Vector3Tuple;
  material: MaterialSpec;
  parts: PrimitivePart[];
};

export type SceneDocument = {
  id: string;
  roomType: string;
  theme: string;
  dimensions: { width: number; depth: number; height: number; unit: string };
  surfaces: SurfacePrimitive[];
  furniture: FurniturePrimitive[];
  lighting: { ambient: number; key: number; temperature: number };
  cameraPresets: Array<{ position: Vector3Tuple; target: Vector3Tuple }>;
  analytics: {
    floorArea: number;
    walkableArea: number;
    budgetEstimate: BudgetEstimate;
    scores: ScoreBreakdown;
    materialSchedule: MaterialPlanItem[];
    clearanceNotes: string[];
    lightingPlan: string[];
    sustainabilityNotes: string[];
  };
};

export type Project = {
  id: string;
  userId: string;
  status: "concepts_ready" | "scene_ready";
  brief: DesignBrief;
  sourceImage: Asset;
  concepts: DesignConcept[];
  selectedConceptId: string | null;
  scene: SceneDocument | null;
  createdAt: string;
  updatedAt: string;
};

export type RedesignResponse = {
  project: Project;
  concepts: DesignConcept[];
};

export type RedesignPayload = {
  userId: string;
  image: File;
  roomType: string;
  themes: string[];
  palette: string[];
  constraints: string;
  budgetRange: string;
  lifestyle: string;
  priority: string;
};
