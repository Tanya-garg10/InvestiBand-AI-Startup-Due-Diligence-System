export const AGENTS = ["research", "market", "finance", "risk"] as const;
export type AgentId = (typeof AGENTS)[number];

export interface AgentScore {
  overall: number;
  breakdown: Record<string, number>;
}

export interface AgentOutput {
  agent: AgentId | "decision";
  summary: string;
  score: AgentScore;
  analysis: string[];
  red_flags: string[];
  citations?: string[];
  veto?: boolean;
  veto_reason?: string;
}

export interface DebateRound {
  from_agent: AgentId;
  to_agent: AgentId;
  message: string;
  response: string;
}

export interface Verdict {
  decision: "INVEST" | "AVOID" | "WAIT";
  confidence_score: number;
  summary: string;
  scores: {
    team: number;
    market: number;
    finance: number;
    risk: number;
  };
}

export interface AnalysisResult {
  id: string;
  startup_name: string;
  investment_amount: number | null;
  risk_preference: string | null;
  agents: Partial<Record<AgentId, AgentOutput>>;
  decision: AgentOutput;
  debate: DebateRound[];
  verdict: Verdict;
  created_at: string;
}

export interface Report {
  id: string;
  startup_name: string;
  investment_amount: number | null;
  risk_preference: string | null;
  verdict: string | null;
  confidence_score: number | null;
  results: AnalysisResult | null;
  created_at: string;
}

export type SSEEvent =
  | { type: "agent_start"; agent: AgentId }
  | { type: "agent_update"; agent: AgentId; data: AgentOutput }
  | { type: "agent_complete"; agent: AgentId; data: AgentOutput }
  | { type: "debate_message"; debate: DebateRound }
  | { type: "verdict"; verdict: Verdict }
  | { type: "error"; error: string }
  | { type: "complete"; results: AnalysisResult };
