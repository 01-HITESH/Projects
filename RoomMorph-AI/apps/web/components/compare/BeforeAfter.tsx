"use client";

import { assetUrl } from "@/lib/api";
import type { DesignConcept, Project } from "@/types/project";

type BeforeAfterProps = {
  project: Project | null;
  selectedConcept: DesignConcept | null;
};

export function BeforeAfter({ project, selectedConcept }: BeforeAfterProps) {
  const before = assetUrl(project?.sourceImage.url);
  const after = assetUrl(selectedConcept?.previewUrl);

  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-steel">Comparison</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">Before and after</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Frame label="Original" url={before} />
        <Frame label="Redesigned" url={after} />
      </div>
    </section>
  );
}

function Frame({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="relative min-h-72 overflow-hidden rounded-lg border border-ink/10 bg-mist">
      {url ? <img alt="" className="h-full min-h-72 w-full object-cover" src={url} /> : <div className="flex min-h-72 items-center justify-center text-sm text-ink/55">Pending</div>}
      <span className="absolute left-3 top-3 rounded-lg bg-chalk/90 px-3 py-1 text-xs font-medium shadow-soft">{label}</span>
    </div>
  );
}
