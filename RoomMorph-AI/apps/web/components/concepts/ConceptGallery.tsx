"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";

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
                  "focus-ring overflow-hidden rounded-lg border bg-chalk text-left transition hover:-translate-y-0.5 hover:shadow-soft",
                  active ? "border-ink" : "border-ink/10",
                ].join(" ")}
                key={concept.id}
                type="button"
                onClick={() => onSelect(concept.id)}
              >
                <div className="relative">
                  <img alt="" className="h-44 w-full object-cover" src={assetUrl(concept.previewUrl) ?? ""} />
                  {active ? <CheckCircle2 className="absolute right-3 top-3 h-6 w-6 rounded-full bg-chalk text-ink" /> : null}
                </div>
                <div className="space-y-3 p-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{concept.title}</p>
                    <p className="mt-1 text-xs text-ink/55">{concept.theme} / {Math.round(concept.score * 100)}% match</p>
                  </div>
                  <p className="text-sm leading-5 text-ink/65">{concept.rationale}</p>
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
