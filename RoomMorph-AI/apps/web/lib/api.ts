import type {
  GenerationStatus,
  Project,
  RedesignPayload,
  RedesignResponse,
  SceneDocument,
  User,
} from "@/types/project";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function assetUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function login(email: string, name: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  const data = await parseResponse<{ user: User }>(response);
  return data.user;
}

export async function createRedesigns(payload: RedesignPayload): Promise<RedesignResponse> {
  const formData = new FormData();
  formData.append("image", payload.image);
  formData.append("userId", payload.userId);
  formData.append("roomType", payload.roomType);
  formData.append("themes", payload.themes.join(","));
  formData.append("palette", payload.palette.join(","));
  formData.append("constraints", payload.constraints);
  formData.append("budgetRange", payload.budgetRange);
  formData.append("lifestyle", payload.lifestyle);
  formData.append("priority", payload.priority);
  const response = await fetch(`${API_BASE_URL}/api/redesigns`, { method: "POST", body: formData });
  return parseResponse<RedesignResponse>(response);
}

export async function getGenerationStatus(): Promise<GenerationStatus> {
  const response = await fetch(`${API_BASE_URL}/api/generation/status`, { cache: "no-store" });
  return parseResponse<GenerationStatus>(response);
}

export async function selectConcept(projectId: string, conceptId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/select`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conceptId }),
  });
  return parseResponse<Project>(response);
}

export async function createScene(projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/scene`, { method: "POST" });
  return parseResponse<Project>(response);
}

export async function saveScene(projectId: string, scene: SceneDocument): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/scene`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scene }),
  });
  return parseResponse<Project>(response);
}

export async function listProjects(userId: string): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/api/projects?userId=${encodeURIComponent(userId)}`, { cache: "no-store" });
  return parseResponse<Project[]>(response);
}

export async function deleteProject(projectId: string, userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}?userId=${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
  await parseResponse<{ status: string; projectId: string }>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }
  let message = response.statusText || "Request failed.";
  try {
    const body = (await response.json()) as { detail?: string };
    if (body.detail) {
      message = body.detail;
    }
  } catch {
    // Keep the status text.
  }
  throw new ApiError(message, response.status);
}
