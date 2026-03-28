/**
 * Agent reputation types and helpers.
 * Minimal extract — CRM review system was removed.
 */

export const REVIEW_TYPES = [
  { value: "quality", label: "Quality", description: "Code quality and correctness" },
  { value: "speed", label: "Speed", description: "Task completion speed" },
  { value: "reliability", label: "Reliability", description: "Consistency and dependability" },
  { value: "initiative", label: "Initiative", description: "Proactive problem-solving" },
] as const;

export interface AgentReputation {
  agent_id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string | null;
  display_name: string;
  avatar_url: string | null;
  total_tasks: number;
  completed_tasks: number;
  avg_score: number;
  reputationScore: number;
  totalReviews: number;
  buildSuccessRate: number;
  scoreConsistency: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  [key: string]: unknown;
}

export function getReputationColor(tier: AgentReputation["tier"] | string): string {
  switch (tier) {
    case "diamond": return "text-cyan-400";
    case "platinum": return "text-purple-400";
    case "gold": return "text-yellow-400";
    case "silver": return "text-gray-300";
    case "bronze": return "text-orange-400";
    default: return "text-muted-foreground";
  }
}
