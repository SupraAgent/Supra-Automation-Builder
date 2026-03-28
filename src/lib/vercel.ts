import type { Deployment, DeploymentStatus } from "./deployments";

const VERCEL_API = "https://api.vercel.com";

type VercelDeployment = {
  uid: string;
  name: string;
  url: string;
  state: string;
  meta?: {
    githubCommitSha?: string;
    githubCommitMessage?: string;
    githubCommitAuthorLogin?: string;
    githubCommitRef?: string;
    githubOrg?: string;
    githubRepo?: string;
  };
  target: string | null;
  createdAt: number;
  buildingAt?: number;
  ready?: number;
  creator?: { username?: string };
  errorMessage?: string;
  checksConclusion?: string;
};

function mapVercelState(state: string): DeploymentStatus {
  const map: Record<string, DeploymentStatus> = {
    READY: "ready",
    BUILDING: "building",
    ERROR: "failed",
    CANCELED: "cancelled",
    CANCELLED: "cancelled",
    QUEUED: "building",
    INITIALIZING: "building",
  };
  return map[state?.toUpperCase()] ?? "building";
}

/** Fetch deployments from Vercel for a single token. */
export async function fetchVercelDeployments(
  token: string,
  options?: { limit?: number; projectId?: string }
): Promise<Deployment[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.projectId) params.set("projectId", options.projectId);

  const res = await fetch(`${VERCEL_API}/v6/deployments?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("[vercel] deployments fetch failed:", res.status);
    return [];
  }

  const data = await res.json();
  const deployments: VercelDeployment[] = data.deployments ?? [];

  return deployments.map((d) => ({
    id: d.uid,
    project: d.name,
    branch: d.meta?.githubCommitRef ?? "main",
    commitSha: (d.meta?.githubCommitSha ?? "").slice(0, 7) || "unknown",
    commitMessage: d.meta?.githubCommitMessage ?? d.name ?? "",
    author: d.meta?.githubCommitAuthorLogin ?? d.creator?.username ?? "unknown",
    status: mapVercelState(d.state),
    env: d.target === "production" ? "production" as const : "preview" as const,
    previewUrl: d.url ? `https://${d.url}` : undefined,
    createdAt: new Date(d.createdAt).toISOString(),
    buildingAt: d.buildingAt,
    readyAt: d.ready,
    buildDuration: d.ready && d.buildingAt ? d.ready - d.buildingAt : null,
    repoOwner: d.meta?.githubOrg ?? undefined,
    repoName: d.meta?.githubRepo ?? undefined,
    buildError: d.errorMessage ?? undefined,
  }));
}

/** Fetch Vercel user info to validate a token. */
export async function fetchVercelUser(token: string) {
  const res = await fetch(`${VERCEL_API}/v2/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user as { username: string; name: string } | undefined;
}

/** Fetch Vercel projects for a token. */
export async function fetchVercelProjects(token: string) {
  const res = await fetch(`${VERCEL_API}/v9/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.projects ?? []) as Array<{ id: string; name: string }>;
}
