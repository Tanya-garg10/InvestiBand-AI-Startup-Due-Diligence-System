import { MessageSquare } from "lucide-react";
import type { DebateRound } from "../types";

interface DebatePanelProps {
  debates: DebateRound[];
  loading: boolean;
}

const AGENT_LABELS: Record<string, string> = {
  research: "Research",
  market: "Market",
  finance: "Finance",
  risk: "Risk",
};

const AGENT_COLORS: Record<string, string> = {
  research: "text-research border-research/30 bg-research-dim/30",
  market: "text-market border-market/30 bg-market-dim/30",
  finance: "text-finance border-finance/30 bg-finance-dim/30",
  risk: "text-risk border-risk/30 bg-risk-dim/30",
};

export default function DebatePanel({ debates, loading }: DebatePanelProps) {
  if (!loading && debates.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-light bg-surface-card/60">
      <div className="flex items-center gap-2 border-b border-border-light px-4 py-3">
        <MessageSquare className="h-3.5 w-3.5 text-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Agent Debate
        </span>
        {loading && (
          <span className="ml-auto text-[10px] text-muted animate-pulse">
            Agents conferring...
          </span>
        )}
      </div>

      <div className="divide-y divide-border-light">
        {debates.map((debate, i) => (
          <div key={i} className="px-4 py-3">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${AGENT_COLORS[debate.from_agent] || "text-muted border-border-light bg-surface-card"}`}
              >
                {AGENT_LABELS[debate.from_agent] || debate.from_agent}
              </span>
              <span className="text-[10px] text-muted">→</span>
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${AGENT_COLORS[debate.to_agent] || "text-muted border-border-light bg-surface-card"}`}
              >
                {AGENT_LABELS[debate.to_agent] || debate.to_agent}
              </span>
            </div>
            <div className="space-y-1.5 pl-1">
              <p className="text-[11px] leading-relaxed text-muted">
                <span className="font-medium text-foreground">Q:</span> {debate.message}
              </p>
              <p className="text-[11px] leading-relaxed text-muted">
                <span className="font-medium text-foreground">A:</span> {debate.response}
              </p>
            </div>
          </div>
        ))}

        {/* Loading placeholder */}
        {loading && debates.length === 0 && (
          <div className="px-4 py-3">
            <div className="animate-pulse space-y-2">
              <div className="h-3 w-48 rounded bg-muted/10" />
              <div className="h-3 w-64 rounded bg-muted/10" />
              <div className="h-3 w-40 rounded bg-muted/10" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}