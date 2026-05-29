"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Home } from "lucide-react";

import { LoginView } from "@/components/auth/LoginView";
import { BeforeAfter } from "@/components/compare/BeforeAfter";
import { ConceptGallery } from "@/components/concepts/ConceptGallery";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { DesignIntelligence } from "@/components/insights/DesignIntelligence";
import { SceneViewer } from "@/components/viewer/SceneViewer";
import { UploadBrief } from "@/components/upload/UploadBrief";
import { WorkflowStrategy } from "@/components/strategy/WorkflowStrategy";
import {
  createRedesigns,
  createScene,
  deleteProject,
  listProjects,
  login,
  selectConcept,
  saveScene,
} from "@/lib/api";
import type { Project, RedesignPayload, SceneDocument, User } from "@/types/project";

type ViewMode = "login" | "home" | "studio";

const userStorageKey = "roommorph-user";

export function StudioApp() {
  const [view, setView] = useState<ViewMode>("login");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sceneSaving, setSceneSaving] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(userStorageKey);
    if (!stored) {
      return;
    }
    try {
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
      setView("home");
      void refreshHistory(parsed.id);
    } catch {
      window.localStorage.removeItem(userStorageKey);
    }
  }, []);

  const selectedConcept = useMemo(() => {
    return project?.concepts.find((item) => item.id === selectedConceptId) ?? null;
  }, [project, selectedConceptId]);

  async function handleLogin(email: string, name: string) {
    setAuthLoading(true);
    setError(null);
    try {
      const nextUser = await login(email, name);
      setUser(nextUser);
      window.localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
      setView("home");
      await refreshHistory(nextUser.id);
      return nextUser;
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function refreshHistory(userId = user?.id) {
    if (!userId) {
      return;
    }
    setHistoryLoading(true);
    try {
      const items = await listProjects(userId);
      setProjects(items);
    } catch {
      setProjects([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleGenerate(payload: RedesignPayload) {
    if (!user) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const redesign = await createRedesigns({ ...payload, userId: user.id });
      setProject(redesign.project);
      setSelectedConceptId(redesign.concepts[0]?.id ?? null);
      setSelectedFurnitureId(redesign.project.scene?.furniture[0]?.id ?? null);
      setView("studio");
      await refreshHistory(user.id);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(conceptId: string) {
    if (!project) {
      return;
    }
    setLoading(true);
    try {
      const updated = await selectConcept(project.id, conceptId);
      setProject(updated);
      setSelectedConceptId(conceptId);
      setSelectedFurnitureId(updated.scene?.furniture[0]?.id ?? null);
      if (user) {
        await refreshHistory(user.id);
      }
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : "Selection failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuildScene() {
    if (!project || !selectedConceptId) {
      return;
    }
    setLoading(true);
    try {
      const updated = await createScene(project.id);
      setProject(updated);
      setSelectedFurnitureId(updated.scene?.furniture[0]?.id ?? null);
      if (user) {
        await refreshHistory(user.id);
      }
    } catch (sceneError) {
      setError(sceneError instanceof Error ? sceneError.message : "3D generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveScene(updater: (scene: SceneDocument) => SceneDocument) {
    if (!project || !project.scene) {
      return;
    }
    setSceneSaving(true);
    try {
      const nextScene = updater(project.scene);
      const updated = await saveScene(project.id, nextScene);
      setProject(updated);
      if (user) {
        await refreshHistory(user.id);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      setSceneSaving(false);
    }
  }

  async function handleDelete(projectToDelete: Project) {
    if (!user) {
      return;
    }
    await deleteProject(projectToDelete.id, user.id);
    if (project?.id === projectToDelete.id) {
      setProject(null);
      setSelectedConceptId(null);
      setSelectedFurnitureId(null);
      setView("home");
    }
    await refreshHistory(user.id);
  }

  function openProject(item: Project) {
    setProject(item);
    setSelectedConceptId(item.selectedConceptId ?? item.concepts[0]?.id ?? null);
    setSelectedFurnitureId(item.scene?.furniture[0]?.id ?? null);
    setView("studio");
  }

  function logout() {
    window.localStorage.removeItem(userStorageKey);
    setUser(null);
    setProject(null);
    setProjects([]);
    setSelectedConceptId(null);
    setSelectedFurnitureId(null);
    setView("login");
  }

  if (view === "login" || !user) {
    return <LoginView error={error} loading={authLoading} onLogin={handleLogin} />;
  }

  if (view === "home") {
    return (
      <HomeDashboard
        loading={historyLoading}
        projects={projects}
        user={user}
        onCreate={() => {
          setProject(null);
          setSelectedConceptId(null);
          setSelectedFurnitureId(null);
          setView("studio");
        }}
        onDelete={handleDelete}
        onLogout={logout}
        onOpen={openProject}
      />
    );
  }

  return (
    <main className="min-h-screen px-4 py-4 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
        <header className="glass-bar rounded-lg p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink/10 bg-chalk px-3 py-1.5 text-sm font-medium text-steel hover:bg-ink hover:text-chalk"
                type="button"
                onClick={() => setView("home")}
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </button>
              <div className="eyebrow">
                <Home className="h-4 w-4" />
                RoomMorph AI
              </div>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-5xl">
              Design studio for concept, feasibility, and 360 walkthrough
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/66">
              Upload a room photo, generate ranked concepts, compare visuals, review the execution report, and customize the interactive room.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-ink/65 sm:min-w-[32rem]">
            <Metric label="Concepts" value={String(project?.concepts.length ?? 0)} />
            <Metric label="3D" value={project?.scene ? "Ready" : "Pending"} />
            <Metric label="History" value={historyLoading ? "Loading" : String(projects.length)} />
          </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_320px]">
          <UploadBrief loading={loading} error={error} onSubmit={handleGenerate} userId={user.id} />

          <div className="flex flex-col gap-4">
            <ConceptGallery
              concepts={project?.concepts ?? []}
              loading={loading}
              selectedId={selectedConceptId}
              onBuildScene={handleBuildScene}
              onSelect={handleSelect}
            />

            <BeforeAfter project={project} selectedConcept={selectedConcept} />

            <DesignIntelligence concept={selectedConcept} scene={project?.scene ?? null} />

            <WorkflowStrategy />

            <SceneViewer
              scene={project?.scene ?? null}
              selectedFurnitureId={selectedFurnitureId}
              saving={sceneSaving}
              onSave={async () => {
                if (project?.scene) {
                  await handleSaveScene((scene) => scene);
                }
              }}
              onSelectFurniture={setSelectedFurnitureId}
              onUpdateScene={async (updater) => {
                await handleSaveScene(updater);
              }}
            />
          </div>

          <HistoryPanel projects={projects} onDelete={handleDelete} onOpen={openProject} />
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-chalk/80 px-3 py-2">
      <p className="text-xs font-medium text-steel">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
