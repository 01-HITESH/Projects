"use client";

import { Clock3, FolderOpen, Trash2 } from "lucide-react";

import { assetUrl } from "@/lib/api";
import type { Project } from "@/types/project";

export function HistoryPanel({
  projects,
  onDelete,
  onOpen,
}: {
  projects: Project[];
  onDelete: (project: Project) => Promise<void>;
  onOpen: (project: Project) => void;
}) {
  return (
    <aside className="panel thin-scrollbar max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg p-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-steel">Saved</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">Design history</h2>
        <p className="mt-2 text-sm leading-5 text-ink/58">Open previous rooms and compare presentation progress.</p>
      </div>
      <div className="space-y-2">
        {projects.length ? projects.map((project) => {
          const imageUrl = assetUrl(project.sourceImage.url);
          return (
            <div className="rounded-lg border border-ink/10 bg-chalk p-2 shadow-sm transition hover:border-steel/35" key={project.id}>
              <button className="focus-ring flex w-full gap-3 text-left hover:border-steel" type="button" onClick={() => onOpen(project)}>
                {imageUrl ? <img alt="" className="h-16 w-16 rounded-md object-cover" src={imageUrl} /> : null}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{project.brief.roomType}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-ink/55">
                    <Clock3 className="h-3 w-3" />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </span>
              </button>
              <button
                className="focus-ring mt-2 inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-clay/30 bg-clay/10 text-xs font-medium hover:bg-clay hover:text-chalk"
                type="button"
                onClick={() => onDelete(project)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          );
        }) : (
          <div className="rounded-lg border border-dashed border-ink/12 bg-chalk/60 px-3 py-8 text-center text-sm text-ink/55">
            <FolderOpen className="mx-auto mb-3 h-6 w-6 text-steel" />
            Saved redesigns will appear here.
          </div>
        )}
      </div>
    </aside>
  );
}
