export type DeploymentStatus = "building" | "ready" | "failed" | "cancelled";
export type DeploymentEnv = "production" | "preview";

export type Deployment = {
  id: string;
  project?: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  author: string;
  authorAvatar?: string;
  status: DeploymentStatus;
  env: DeploymentEnv;
  previewUrl?: string;
  createdAt: string;
  buildingAt?: number;
  readyAt?: number;
  buildDuration?: number | null;
  isCurrentUser?: boolean;
  isAgent?: boolean;
  repoOwner?: string;
  repoName?: string;
  buildError?: string;
};

export type DeploymentComment = {
  id: string;
  deploymentId: string;
  author: string;
  body: string;
  createdAt: string;
};

export type DeploymentShare = {
  id: string;
  deploymentId: string;
  sharedWith: string;
  createdAt: string;
};

export type DeploymentLike = {
  id: string;
  deploymentId: string;
  userId: string;
  createdAt: string;
};

export type DeploymentStar = {
  id: string;
  deploymentId: string;
  userId: string;
  createdAt: string;
};
