import type { Deployment } from "./deployments";

export type AgentProfile = {
  id: string;
  githubUsername: string;
  displayName: string;
  avatarUrl: string;
  isAgent: true;
};

export type AgentBatch = {
  batchId: string;
  agentName: string;
  branch: string;
  deployments: Deployment[];
  latestStatus: Deployment["status"];
  latestDeployedAt: string;
};

export type ExperimentResult = {
  ts: string;
  cycle: number;
  score: number;
  recommendation: string;
  status: string;
  error?: string;
};

/** Parse branch name into agent name and batch ID.
 *  Expected format: agent/<name>/<batch> */
export function parseBranch(branch: string): { agentName: string; batchId: string } | null {
  const match = branch.match(/^agent\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return { agentName: match[1], batchId: match[2] };
}

/** Group deployments into batches by branch. */
export function groupIntoBatches(deployments: Deployment[]): AgentBatch[] {
  const byBranch = new Map<string, Deployment[]>();
  for (const d of deployments) {
    const existing = byBranch.get(d.branch) ?? [];
    existing.push(d);
    byBranch.set(d.branch, existing);
  }

  const batches: AgentBatch[] = [];
  for (const [branch, deps] of byBranch) {
    const parsed = parseBranch(branch);
    const sorted = deps.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    batches.push({
      batchId: parsed?.batchId ?? branch,
      agentName: parsed?.agentName ?? deps[0]?.author ?? "unknown",
      branch,
      deployments: sorted,
      latestStatus: sorted[0]?.status ?? "building",
      latestDeployedAt: sorted[0]?.createdAt ?? "",
    });
  }

  return batches.sort(
    (a, b) => new Date(b.latestDeployedAt).getTime() - new Date(a.latestDeployedAt).getTime()
  );
}
