"use client";

import { AlertTriangle, CheckCircle2, Clock3, Gauge, Leaf, Lightbulb, Ruler, WalletCards } from "lucide-react";
import type { ReactNode } from "react";

import type { BudgetEstimate, DesignConcept, MaterialPlanItem, SceneDocument, ScoreBreakdown } from "@/types/project";

type DesignIntelligenceProps = {
  concept: DesignConcept | null;
  scene: SceneDocument | null;
};

export function DesignIntelligence({ concept, scene }: DesignIntelligenceProps) {
  if (!concept) {
    return (
      <section className="panel rounded-lg p-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-steel">Design intelligence</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">Practical report pending</h2>
        </div>
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-ink/12 bg-chalk/60 text-sm text-ink/55">
          Generate concepts to see feasibility, budget, materials, and execution notes.
        </div>
      </section>
    );
  }

  const analytics = scene?.analytics;
  const scores = analytics?.scores ?? concept.scoreBreakdown;
  const budget = analytics?.budgetEstimate ?? concept.budget;
  const materials = analytics?.materialSchedule?.length ? analytics.materialSchedule : concept.materialPlan;

  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-steel">Design intelligence</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">Feasibility, budget, and material report</h2>
          <p className="mt-2 text-sm leading-5 text-ink/58">A presentation-ready summary that connects the visual concept to real-world execution.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-ink/10 bg-chalk px-3 py-1.5 text-sm font-medium text-ink">
          <Gauge className="h-4 w-4 text-steel" />
          {Math.round(concept.score * 100)}% concept match
        </div>
      </div>

      <div className="grid gap-px overflow-hidden rounded-lg border border-ink/10 bg-ink/10 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<WalletCards className="h-4 w-4" />} label="Budget estimate" value={formatBudget(budget)} />
        <Stat icon={<Clock3 className="h-4 w-4" />} label="Timeline" value={`${budget.timelineWeeks} weeks`} />
        <Stat icon={<Ruler className="h-4 w-4" />} label="Walkable area" value={analytics ? `${analytics.walkableArea} sqm` : "After 3D"} />
        <Stat icon={<Leaf className="h-4 w-4" />} label="Sustainability" value={`${Math.round(scores.sustainability * 100)}%`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <ScoreList scores={scores} />

          <div className="rounded-lg border border-ink/10 bg-chalk p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <CheckCircle2 className="h-4 w-4 text-sage" />
              Design strengths
            </div>
            <ul className="space-y-2 text-sm leading-5 text-ink/66">
              {concept.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-ink/10 bg-chalk p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <AlertTriangle className="h-4 w-4 text-clay" />
              Tradeoffs to mention
            </div>
            <ul className="space-y-2 text-sm leading-5 text-ink/66">
              {concept.tradeoffs.map((item) => (
                <li key={item}>{item}</li>
              ))}
              {budget.notes.slice(0, 1).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <MaterialSchedule materials={materials} />

          {analytics ? (
            <div className="grid gap-4 md:grid-cols-2">
              <NoteGroup icon={<Ruler className="h-4 w-4" />} title="Clearance audit" notes={analytics.clearanceNotes} />
              <NoteGroup icon={<Lightbulb className="h-4 w-4" />} title="Lighting plan" notes={analytics.lightingPlan} />
              <NoteGroup icon={<Leaf className="h-4 w-4" />} title="Sustainability notes" notes={analytics.sustainabilityNotes} wide />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-ink/12 bg-chalk/60 p-4 text-sm leading-6 text-ink/60">
              Generate the 360 room to unlock clearance, lighting, and material analytics from the 3D layout.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-chalk p-3 transition hover:bg-white">
      <div className="flex items-center gap-2 text-xs font-medium text-steel">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function ScoreList({ scores }: { scores: ScoreBreakdown }) {
  const items = [
    ["Style match", scores.styleMatch],
    ["Feasibility", scores.feasibility],
    ["Budget fit", scores.budgetFit],
    ["Maintainability", scores.maintainability],
    ["Sustainability", scores.sustainability],
  ] as const;

  return (
    <div className="rounded-lg border border-ink/10 bg-chalk p-3 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-ink">Decision scorecard</p>
      <div className="space-y-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-ink/65">
              <span>{label}</span>
              <span>{Math.round(value * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-mist">
              <div className="h-full rounded-full bg-steel" style={{ width: `${Math.round(value * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialSchedule({ materials }: { materials: MaterialPlanItem[] }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-chalk p-3 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-ink">Material schedule</p>
      <div className="overflow-hidden rounded-lg border border-ink/10">
        {materials.map((material, index) => (
          <div className="grid gap-2 border-b border-ink/10 p-3 text-sm last:border-b-0 md:grid-cols-[0.9fr_1.1fr]" key={`${material.item}-${index}`}>
            <div>
              <p className="font-semibold text-ink">{material.item}</p>
              <p className="mt-1 text-xs text-ink/55">{material.material}</p>
            </div>
            <div className="text-xs leading-5 text-ink/62">
              <p>{material.finish}</p>
              <p>{material.durability} durability / {material.care}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteGroup({
  icon,
  notes,
  title,
  wide = false,
}: {
  icon: ReactNode;
  notes: string[];
  title: string;
  wide?: boolean;
}) {
  return (
    <div className={["rounded-lg border border-ink/10 bg-chalk p-3 shadow-sm", wide ? "md:col-span-2" : ""].join(" ")}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        {icon}
        {title}
      </div>
      <ul className="space-y-2 text-sm leading-5 text-ink/66">
        {notes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function formatBudget(budget: BudgetEstimate) {
  const low = Math.round(budget.minInr / 1000);
  const high = Math.round(budget.maxInr / 1000);
  return `INR ${low}k-${high}k`;
}
