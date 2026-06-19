import { ArrowUpRight, Ban, Clock, TrendingUp, Users, DollarSign, Shield } from "lucide-react";
import type { Verdict } from "../types";

interface VerdictCardProps {
  verdict: Verdict | null;
  loading: boolean;
}

function VerdictBadge({ decision }: { decision: string }) {
  const styles: Record<string, string> = {
    INVEST: "bg-market-dim text-market border-market/30",
    AVOID: "bg-risk-dim text-risk border-risk/30",
    WAIT: "bg-finance-dim text-finance border-finance/30",
  };

  const icons: Record<string, React.ReactNode> = {
    INVEST: <ArrowUpRight className="h-3.5 w-3.5" />,
    AVOID: <Ban className="h-3.5 w-3.5" />,
    WAIT: <Clock className="h-3.5 w-3.5" />,
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${styles[decision] || "text-muted border-border-light"}`}
    >
      {icons[decision]}
      {decision}
    </div>
  );
}

function ScoreMeter({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const percentage = (value / 10) * 100;
  const color =
    value >= 8
      ? "bg-market"
      : value >= 6
        ? "bg-finance"
        : "bg-risk";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-muted">{icon}</span>
          <span className="text-[11px] font-medium text-muted">{label}</span>
        </div>
        <span className="font-mono text-xs font-bold text-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function VerdictCard({ verdict, loading }: VerdictCardProps) {
  if (!loading && !verdict) return null;

  // Loading skeleton
  if (loading && !verdict) {
    return (
      <div className="rounded-xl border border-border-light bg-surface-card">
        <div className="border-b border-border-light px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Final Verdict
          </span>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-24 rounded-lg bg-muted/10" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="mb-1 h-3 w-24 rounded bg-muted/10" />
                  <div className="h-1.5 rounded-full bg-muted/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!verdict) return null;

  return (
    <div className="rounded-xl border border-border-light bg-gradient-to-b from-surface-card to-surface-card/60">
      {/* Verdict header */}
      <div className="border-b border-border-light px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Final Verdict
          </span>
          <VerdictBadge decision={verdict.decision} />
        </div>
      </div>

      {/* Summary */}
      <div className="border-b border-border-light px-4 py-3">
        <p className="text-xs leading-relaxed text-muted">{verdict.summary}</p>
      </div>

      {/* Score breakdown */}
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Confidence Score</span>
          <span className="font-mono text-base font-bold text-decision">
            {verdict.confidence_score.toFixed(0)}%
          </span>
        </div>

        <div className="space-y-2.5">
          <ScoreMeter label="Team" value={verdict.scores.team} icon={<Users className="h-3 w-3" />} />
          <ScoreMeter label="Market" value={verdict.scores.market} icon={<TrendingUp className="h-3 w-3" />} />
          <ScoreMeter label="Finance" value={verdict.scores.finance} icon={<DollarSign className="h-3 w-3" />} />
          <ScoreMeter label="Risk" value={verdict.scores.risk} icon={<Shield className="h-3 w-3" />} />
        </div>
      </div>
    </div>
  );
}