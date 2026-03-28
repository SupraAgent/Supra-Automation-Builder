export type AgentTaskStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "timed_out";

export type AgentTaskType = "experiment" | "code_review" | "deploy" | "custom";

export type AgentTask = {
  id: string;
  agentUserId: string;
  agentName?: string;
  agentAvatar?: string;
  title: string;
  taskType: AgentTaskType;
  status: AgentTaskStatus;
  priority: number;
  input?: Record<string, unknown>;
  output?: {
    summary?: string;
    files_changed?: string[];
    diff_url?: string;
    experiment_score?: number;
    tokens_used?: number;
    [key: string]: unknown;
  };
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  deploymentId?: string;
  branch?: string;
  assignedBy?: string;
  assignedByName?: string;
  instructions?: string;
};

export type AgentTaskLog = {
  id: number;
  taskId: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  createdAt: string;
};

/** Map a Supabase row to an AgentTask. */
export function mapTask(row: Record<string, unknown>): AgentTask {
  return {
    id: row.id as string,
    agentUserId: row.agent_user_id as string,
    agentName: row.agent_name as string | undefined,
    agentAvatar: row.agent_avatar as string | undefined,
    title: row.title as string,
    taskType: row.task_type as AgentTaskType,
    status: row.status as AgentTaskStatus,
    priority: row.priority as number,
    input: row.input as Record<string, unknown> | undefined,
    output: row.output as AgentTask["output"],
    errorMessage: row.error_message as string | undefined,
    startedAt: row.started_at as string | undefined,
    completedAt: row.completed_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    deploymentId: row.deployment_id as string | undefined,
    branch: row.branch as string | undefined,
    assignedBy: row.assigned_by as string | undefined,
    instructions: row.instructions as string | undefined,
  };
}

/** Map a Supabase row to an AgentTaskLog. */
export function mapLog(row: Record<string, unknown>): AgentTaskLog {
  return {
    id: row.id as number,
    taskId: row.task_id as string,
    level: row.level as AgentTaskLog["level"],
    message: row.message as string,
    createdAt: row.created_at as string,
  };
}
