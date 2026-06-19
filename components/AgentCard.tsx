import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import type { AgentId, AgentOutput } from "../types";

interface AgentCardProps {
  agent: AgentId;
  output: AgentOutput | null;
  loading: boolean;
}

const AGENT_META: Record<AgentId, { label: string; color: string; dim: string; glow: string }> = {
  research: {
    label: "Research Agent",
    color: "text-research",
    dim: "bg-research-dim",
    glow: "shadow-glow-blue",
  },
  market: {
    label: "Market Agent",
    color: "text-market",
    dim: "bg-market-dim",
    glow: "shadow-glow-green",
  },
  finance: {
    label: "Finance Agent",
    color: "text-finance",
    dim: "bg-finance-dim",
    glow: "shadow-glow-amber",
  },
  risk: {
    label: "Risk Agent",
    color: "text-risk",
    dim: "bg-risk-dim",
    glow: "shadow-glow-red",
  },
};

function ScoreBadge({ score, color }: { score: number; color: string }) {
  const hue =
    score >= 8 ? "text-market" : score >= 6 ? "text-finance" : "text-risk";
  return (
    <span className={`font-mono text-lg font-bold ${hue}`}>
      {score.toFixed(1)}
    </span>
  );
}

export default function AgentCard({ agent, output, loading }: AgentCardProps) {
  const meta = AGENT_META[agent];
  const [expanded, setExpanded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (loading) {
      setShowSkeleton(true);
      const timer = setTimeout(() => setShowSkeleton(false), 800);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const isRiskVeto = agent === "risk" && output?.veto;

  return (
    <div
      className={`group rounded-xl border transition-all duration-300 ${
        loading
          ? "border-research/20 bg-surface-card animate-pulse"
          : output
            ? `border-border-light bg-surface-card ${isRiskVeto ? "shadow-glow-red" : `hover:${meta.glow}`}`
            : "border-border-light bg-surface-card/60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`h-2.5 w-2.5 rounded-full ${loading ? "animate-pulse bg-research" : output ? meta.color.replace("text", "bg") : "bg-muted/30"}`} />
          <span className={`text-xs font-semibold uppercase tracking-wider ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-research" />
              <span className="text-[10px] text-muted">Processing...</span>
            </div>
          ) : output ? (
            <>
              <ScoreBadge score={output.score.overall} color={meta.color} />
              {isRiskVeto && (
                <div className="flex items-center gap-1 rounded-md bg-risk-dim px-2 py-0.5">
                  <AlertTriangle className="h-3 w-3 text-risk" />
                  <span className="text-[10px] font-bold text-risk">VETO</span>
                </div>
              )}
            </>
          ) : (
            <span className="text-[10px] text-muted">Waiting...</span>
          )}
        </div>
      </div>

      {/* Content */}
      {output && (
        <div className="px-4 py-3">
          <p className="text-xs leading-relaxed text-muted">{output.summary}</p>

          {/* Analysis bullets */}
          {output.analysis.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {output.analysis.slice(0, expanded ? undefined : 2).map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className={`mt-0.5 h-3 w-3 shrink-0 ${meta.color}`} />
                  <span className="text-[11px] leading-relaxed text-muted">{point}</span>
                </div>
              ))}
            </div>
          )}

          {/* Red flags */}
          {output.red_flags.length > 0 && (
            <div className="mt-2 space-y-1">
              {output.red_flags.slice(0, expanded ? undefined : 1).map((flag, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-risk" />
                  <span className="text-[11px] leading-relaxed text-risk/80">{flag}</span>
                </div>
              ))}
            </div>
          )}

          {/* Expand / Collapse */}
          {(output.analysis.length > 2 || output.red_flags.length > 1) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex cursor-pointer items-center gap-1 text-[10px] text-muted transition-colors hover:text-foreground"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" /> Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" /> More ({output.analysis.length - 2 + output.red_flags.length - 1} more)
                </>
              )}
            </button>
          )}

          {/* Veto reason */}
          {isRiskVeto && output.veto_reason && (
            <div className="mt-3 rounded-lg border border-risk/20 bg-risk-dim/50 p-2.5">
              <p className="text-[11px] leading-relaxed text-risk">{output.veto_reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !output && (
        <div className="space-y-2 px-4 py-3">
          <div className="h-3 w-3/4 rounded bg-muted/10" />
          <div className="h-3 w-1/2 rounded bg-muted/10" />
          <div className="h-3 w-2/3 rounded bg-muted/10" />
        </div>
      )}
    </div>
  );
}