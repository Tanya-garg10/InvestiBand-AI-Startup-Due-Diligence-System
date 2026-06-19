import type { AgentId, AgentOutput, DebateRound, Verdict } from "../types";
import { AGENTS } from "../types";
import AgentCard from "./AgentCard";
import DebatePanel from "./DebatePanel";
import VerdictCard from "./VerdictCard";

interface AnalysisViewProps {
  agents: Partial<Record<AgentId, AgentOutput>>;
  decision: AgentOutput | null;
  debate: DebateRound[];
  verdict: Verdict | null;
  activeAgent: AgentId | null;
  status: string;
}

export default function AnalysisView({
  agents,
  decision,
  debate,
  verdict,
  activeAgent,
  status,
}: AnalysisViewProps) {
  const isStreaming = status === "loading" || status === "streaming";
  const hasAnyContent =
    Object.keys(agents).length > 0 || debate.length > 0 || verdict;

  if (!isStreaming && !hasAnyContent) return null;

  return (
    <div className="w-full space-y-6">
      {/* Agent Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AGENTS.map((agent) => (
          <AgentCard
            key={agent}
            agent={agent}
            output={agents[agent] ?? null}
            loading={isStreaming && !agents[agent]}
          />
        ))}
      </div>

      {/* Debate + Verdict row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DebatePanel debates={debate} loading={isStreaming} />
        </div>
        <div>
          <VerdictCard verdict={verdict} loading={isStreaming && !verdict} />
        </div>
      </div>
    </div>
  );
}