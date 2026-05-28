"use client";

import { ArrowRight, CheckCircle2, Clock3, Gauge, WalletCards } from "lucide-react";
import type { ReactNode } from "react";

import { assetUrl } from "@/lib/api";
import type { DesignConcept } from "@/types/project";

type ConceptGalleryProps = {
  concepts: DesignConcept[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (conceptId: string) => Promise<void>;
  onBuildScene: () => Promise<void>;
};

export function ConceptGallery({ concepts, selectedId, loading, onSelect, onBuildScene }: ConceptGalleryProps) {
  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-steel">Step 2</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">Choose a redesign concept</h2>
          <p className="mt-2 text-sm leading-5 text-ink/58">Compare visual direction, cost, timeline, and practical fit before building 3D.</p>
        </div>
        <button className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-chalk transition hover:bg-steel disabled:cursor-not-allowed disabled:bg-ink/35" disabled={!selectedId || loading} type="button" onClick={onBuildScene}>
          <ArrowRight className="h-4 w-4" />
          Generate 360 room
        </button>
      </div>

      {concepts.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {concepts.map((concept) => {
            const active = concept.id === selectedId;
            return (
              <button
                className={[
                  "focus-ring group overflow-hidden rounded-lg border bg-chalk text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-steel/35 hover:shadow-panel",
                  active ? "border-ink ring-4 ring-steel/10" : "border-ink/10",
                ].join(" ")}
                key={concept.id}
                type="button"
                onClick={() => onSelect(concept.id)}
              >
                <div className="relative">
                  <img alt="" className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={assetUrl(concept.previewUrl) ?? ""} />
                  <span className="absolute left-3 top-3 rounded-lg bg-ink/72 px-2.5 py-1 text-xs font-medium capitalize text-chalk backdrop-blur">
                    {concept.theme}
                  </span>
                  {active ? <CheckCircle2 className="absolute right-3 top-3 h-6 w-6 rounded-full bg-chalk text-ink" /> : null}
                </div>
                <div className="space-y-3 p-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{concept.title}</p>
                    <p className="mt-1 text-xs text-ink/55">{concept.theme} / {Math.round(concept.score * 100)}% match</p>
                  </div>
                  <p className="text-sm leading-5 text-ink/65">{concept.rationale}</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <MiniMetric icon={<Gauge className="h-3.5 w-3.5" />} label="Feasible" value={`${Math.round(concept.scoreBreakdown.feasibility * 100)}%`} />
                    <MiniMetric icon={<WalletCards className="h-3.5 w-3.5" />} label="Budget" value={formatBudget(concept.budget.minInr, concept.budget.maxInr)} />
                    <MiniMetric icon={<Clock3 className="h-3.5 w-3.5" />} label="Time" value={`${concept.budget.timelineWeeks}w`} />
                  </div>
                  <div className="space-y-1.5">
                    {concept.highlights.slice(0, 2).map((item) => (
                      <p className="text-xs leading-4 text-ink/58" key={item}>{item}</p>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {concept.palette.map((color) => (
                      <span className="h-5 w-5 rounded-full border border-ink/10" key={color} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-ink/12 bg-chalk/60 text-sm text-ink/55">
          Generated themes will appear here.
        </div>
      )}
    </section>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-md border border-ink/10 bg-mist/40 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[11px] font-medium text-ink/55">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-xs font-semibold text-ink">{value}</p>
    </div>
  );
}

function formatBudget(minInr: number, maxInr: number) {
  return `${Math.round(minInr / 1000)}-${Math.round(maxInr / 1000)}k`;
}
