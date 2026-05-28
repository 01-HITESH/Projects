"use client";

import { Box, Clock3, Images, LogOut, Plus, Sparkles, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { assetUrl } from "@/lib/api";
import type { Project, User } from "@/types/project";

type HomeDashboardProps = {
  user: User;
  projects: Project[];
  loading: boolean;
  onCreate: () => void;
  onOpen: (project: Project) => void;
  onDelete: (project: Project) => Promise<void>;
  onLogout: () => void;
};

export function HomeDashboard({
  user,
  projects,
  loading,
  onCreate,
  onOpen,
  onDelete,
  onLogout,
}: HomeDashboardProps) {
  const featured = projects.slice(0, 3);

  return (
    <main className="min-h-screen px-4 py-4 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="glass-bar rounded-lg p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="eyebrow mb-3">
              <Box className="h-4 w-4" />
              RoomMorph AI
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Welcome back, {user.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/66">
              Continue a saved room transformation or start a new redesign from a 2D photo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="focus-ring inline-flex h-11 items-center gap-2 rounded-lg border border-ink/10 bg-chalk px-4 text-sm font-medium hover:bg-ink hover:text-chalk" type="button" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Log out
            </button>
            <button className="focus-ring inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-chalk hover:bg-steel" type="button" onClick={onCreate}>
              <Plus className="h-4 w-4" />
              New redesign
            </button>
          </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <HeaderMetric icon={<Images className="h-4 w-4" />} label="Saved rooms" value={loading ? "Loading" : String(projects.length)} />
            <HeaderMetric icon={<Sparkles className="h-4 w-4" />} label="Scene-ready" value={String(projects.filter((item) => item.status === "scene_ready").length)} />
            <HeaderMetric icon={<Clock3 className="h-4 w-4" />} label="Last update" value={projects[0] ? new Date(projects[0].updatedAt).toLocaleDateString() : "No projects"} />
          </div>
        </header>

        <section className="panel rounded-lg p-4">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-steel">Home</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">Previous projects</h2>
            </div>
            <span className="rounded-lg border border-ink/10 bg-chalk px-3 py-1 text-sm text-ink/62">
              {loading ? "Loading" : `${projects.length} saved`}
            </span>
          </div>

          {projects.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={() => onDelete(project)}
                  onOpen={() => onOpen(project)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-ink/12 bg-chalk/60 text-center">
              <div>
                <p className="text-lg font-semibold text-ink">No saved rooms yet</p>
                <p className="mt-2 text-sm text-ink/60">Create your first AI redesign to see it here.</p>
              </div>
            </div>
          )}
        </section>

        {projects.length > 3 ? (
          <section className="grid gap-2">
            {projects.slice(3).map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onDelete={() => onDelete(project)}
                onOpen={() => onOpen(project)}
              />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function ProjectCard({
  project,
  onDelete,
  onOpen,
}: {
  project: Project;
  onDelete: () => Promise<void>;
  onOpen: () => void;
}) {
  const concept = project.concepts.find((item) => item.id === project.selectedConceptId) ?? project.concepts[0];
  const imageUrl = assetUrl(concept?.previewUrl ?? project.sourceImage.url);
  const budget = concept?.budget;

  return (
    <article className="group overflow-hidden rounded-lg border border-ink/10 bg-chalk shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-steel/35 hover:shadow-panel">
      <button className="block w-full text-left" type="button" onClick={onOpen}>
        <div className="relative overflow-hidden">
          {imageUrl ? <img alt="" className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={imageUrl} /> : null}
          <span className="absolute left-3 top-3 rounded-lg bg-ink/76 px-3 py-1 text-xs font-medium text-chalk backdrop-blur">
            {project.status === "scene_ready" ? "3D ready" : "Concepts ready"}
          </span>
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold text-ink">{project.brief.roomType}</p>
          <p className="mt-1 text-xs text-ink/55">{project.status === "scene_ready" ? "3D model ready" : "Concepts ready"} / {new Date(project.updatedAt).toLocaleDateString()}</p>
          {budget ? (
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <CardMetric label="Budget" value={`INR ${Math.round(budget.minInr / 1000)}-${Math.round(budget.maxInr / 1000)}k`} />
              <CardMetric label="Timeline" value={`${budget.timelineWeeks}w`} />
              <CardMetric label="Fit" value={`${Math.round((concept?.scoreBreakdown.feasibility ?? concept.score) * 100)}%`} />
            </div>
          ) : null}
        </div>
      </button>
      <div className="border-t border-ink/10 p-3">
        <button className="focus-ring inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-clay/35 bg-clay/10 text-sm font-medium text-ink hover:bg-clay hover:text-chalk" type="button" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Delete history
        </button>
      </div>
    </article>
  );
}

function HeaderMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-chalk/80 px-3 py-3">
      <p className="flex items-center gap-2 text-xs font-medium text-steel">{icon}{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function CardMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md border border-ink/10 bg-mist/45 px-2 py-1.5">
      <span className="block text-[11px] font-medium text-ink/55">{label}</span>
      <span className="mt-0.5 block truncate font-semibold text-ink">{value}</span>
    </span>
  );
}

function ProjectRow({
  project,
  onDelete,
  onOpen,
}: {
  project: Project;
  onDelete: () => Promise<void>;
  onOpen: () => void;
}) {
  const imageUrl = assetUrl(project.sourceImage.url);

  return (
    <div className="panel flex items-center gap-3 rounded-lg p-2">
      <button className="flex min-w-0 flex-1 items-center gap-3 text-left" type="button" onClick={onOpen}>
        {imageUrl ? <img alt="" className="h-16 w-20 rounded-md object-cover" src={imageUrl} /> : null}
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{project.brief.roomType}</span>
          <span className="block text-xs text-ink/55">{new Date(project.updatedAt).toLocaleDateString()}</span>
        </span>
      </button>
      <button className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 bg-chalk hover:bg-clay hover:text-chalk" type="button" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
