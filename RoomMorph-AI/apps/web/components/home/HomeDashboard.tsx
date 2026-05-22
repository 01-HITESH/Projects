"use client";

import { Box, LogOut, Plus, Trash2 } from "lucide-react";

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
        <header className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-ink/10 bg-chalk px-3 py-1.5 text-sm font-medium text-steel">
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

  return (
    <article className="overflow-hidden rounded-lg border border-ink/10 bg-chalk shadow-soft">
      <button className="block w-full text-left" type="button" onClick={onOpen}>
        <img alt="" className="h-56 w-full object-cover" src={concept?.previewUrl ?? project.sourceImage.url} />
        <div className="p-3">
          <p className="text-sm font-semibold text-ink">{project.brief.roomType}</p>
          <p className="mt-1 text-xs text-ink/55">{project.status === "scene_ready" ? "3D model ready" : "Concepts ready"} · {new Date(project.updatedAt).toLocaleDateString()}</p>
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

function ProjectRow({
  project,
  onDelete,
  onOpen,
}: {
  project: Project;
  onDelete: () => Promise<void>;
  onOpen: () => void;
}) {
  return (
    <div className="panel flex items-center gap-3 rounded-lg p-2">
      <button className="flex min-w-0 flex-1 items-center gap-3 text-left" type="button" onClick={onOpen}>
        <img alt="" className="h-16 w-20 rounded-md object-cover" src={project.sourceImage.url} />
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
