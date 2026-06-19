import { useEffect } from "react";
import { Clock, FileText, X, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import type { Report } from "../types";

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  reports: Report[];
  loading: boolean;
  error: string | null;
  onSelectReport: (report: Report) => void;
  onRefresh: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const VERDICT_COLORS: Record<string, string> = {
  INVEST: "text-market",
  AVOID: "text-risk",
  WAIT: "text-finance",
};

export default function HistoryPanel({
  open,
  onClose,
  reports,
  loading,
  error,
  onSelectReport,
  onRefresh,
}: HistoryPanelProps) {
  useEffect(() => {
    if (open) onRefresh();
  }, [open, onRefresh]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-border-light bg-surface transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border-light px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted" />
            <span className="text-sm font-semibold text-foreground">Report History</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onRefresh}
              className="cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:text-foreground"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-3.5rem)] overflow-y-auto">
          {loading && reports.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted" />
            </div>
          )}

          {error && (
            <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-risk/20 bg-risk-dim/30 px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-risk" />
              <span className="text-[11px] text-risk/80">{error}</span>
            </div>
          )}

          {!loading && reports.length === 0 && !error && (
            <div className="px-4 py-12 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-muted/30" />
              <p className="text-xs text-muted">No past reports yet</p>
              <p className="mt-1 text-[11px] text-muted/60">
                Run an analysis and it will appear here
              </p>
            </div>
          )}

          <div className="space-y-1 p-4">
            {reports.map((report) => {
              const score = report.confidence_score;
              const verdictColor = VERDICT_COLORS[report.verdict ?? ""] || "text-muted";

              return (
                <button
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className="group flex w-full cursor-pointer items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-left transition-all duration-200 hover:border-border-light hover:bg-surface-hover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {report.startup_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-[10px] text-muted">
                        {formatDate(report.created_at)}
                      </span>
                      {report.verdict && (
                        <span className={`text-[10px] font-semibold ${verdictColor}`}>
                          {report.verdict}
                        </span>
                      )}
                    </div>
                  </div>
                  {score !== null && (
                    <span className="ml-3 font-mono text-xs font-bold text-muted">
                      {score}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}