import { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import HeroInput from "./components/HeroInput";
import AnalysisView from "./components/AnalysisView";
import HistoryPanel from "./components/HistoryPanel";
import ApiKeyModal from "./components/ApiKeyModal";
import { useAnalysis } from "./hooks/useAnalysis";
import { useReports } from "./hooks/useReports";
import { Sparkles } from "lucide-react";
import type { Report } from "./types";

const API_KEY_STORAGE_KEY = "investiband_api_key";

export default function App() {
  const { state, startAnalysis, cancelAnalysis } = useAnalysis();
  const { reports, loading: reportsLoading, error: reportsError, refresh: refreshReports, getReport } = useReports();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE_KEY) || "");
  const [viewingReport, setViewingReport] = useState<Report | null>(null);

  // Auto-open API key modal if no key is set
  useEffect(() => {
    if (!apiKey) {
      setApiKeyModalOpen(true);
    }
  }, [apiKey]);

  const handleSaveApiKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  }, []);

  const handleAnalyze = useCallback(
    (params: { startupName: string; investmentAmount?: number; riskPreference?: string }) => {
      setViewingReport(null);
      startAnalysis({ ...params, apiKey });
    },
    [startAnalysis, apiKey]
  );

  const handleSelectReport = useCallback(
    async (report: Report) => {
      const full = report.results ? report : await getReport(report.id);
      if (full) {
        setViewingReport(full);
        setHistoryOpen(false);
        cancelAnalysis();
      }
    },
    [getReport, cancelAnalysis]
  );

  // If viewing a historical report, use its results
  const results = viewingReport?.results;
  const displayState = results
    ? {
        agents: results.agents,
        decision: results.decision,
        debate: results.debate,
        verdict: results.verdict,
        activeAgent: null as string | null,
        status: "complete",
      }
    : state;

  return (
    <div className="min-h-screen bg-background">
      <Header
        onHistoryClick={() => setHistoryOpen(true)}
        onApiKeyClick={() => setApiKeyModalOpen(true)}
        hasApiKey={!!apiKey}
      />

      <main className="mx-auto max-w-7xl px-4 pt-20 pb-12 sm:px-6">
        {/* Hero section */}
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-light bg-surface-card/50 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-research" />
            <span className="text-[11px] text-muted">
              AI-powered startup due diligence
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Analyze a Startup
          </h1>
          <p className="mt-3 text-sm text-muted">
            Enter a startup name and get a structured investment analysis from our
            AI committee
          </p>
        </div>

        {/* Input */}
        <div className="mx-auto mb-8 max-w-2xl">
          <HeroInput
            onAnalyze={handleAnalyze}
            loading={state.status === "loading" || state.status === "streaming"}
          />
        </div>

        {/* Error */}
        {state.error && (
          <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-risk/20 bg-risk-dim/30 px-4 py-3 text-center text-xs text-risk">
            {state.error}
          </div>
        )}

        {/* Analysis Results */}
        <AnalysisView
          agents={displayState.agents}
          decision={displayState.decision}
          debate={displayState.debate}
          verdict={displayState.verdict}
          activeAgent={displayState.activeAgent}
          status={displayState.status}
        />

        {/* Viewing historical report indicator */}
        {viewingReport && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setViewingReport(null)}
              className="cursor-pointer text-xs text-muted underline transition-colors hover:text-foreground"
            >
              Clear historical report and run a new analysis
            </button>
          </div>
        )}
      </main>

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        reports={reports}
        loading={reportsLoading}
        error={reportsError}
        onSelectReport={handleSelectReport}
        onRefresh={refreshReports}
      />

      <ApiKeyModal
        open={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        currentKey={apiKey}
        onSave={handleSaveApiKey}
      />
    </div>
  );
}
