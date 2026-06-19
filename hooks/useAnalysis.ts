import { useState, useCallback, useRef } from "react";
import { streamAnalysis } from "../lib/api";
import { saveReport } from "../lib/storage";
import type { SSEEvent, AgentId, AgentOutput, DebateRound, Verdict } from "../types";

export type AnalysisStatus = "idle" | "loading" | "streaming" | "complete" | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  agents: Partial<Record<AgentId, AgentOutput>>;
  decision: AgentOutput | null;
  debate: DebateRound[];
  verdict: Verdict | null;
  error: string | null;
  activeAgent: AgentId | null;
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    status: "idle",
    agents: {},
    decision: null,
    debate: [],
    verdict: null,
    error: null,
    activeAgent: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const startAnalysis = useCallback((params: { startupName: string; investmentAmount?: number; riskPreference?: string; apiKey: string }) => {
    // Reset state
    setState({
      status: "loading",
      agents: {},
      decision: null,
      debate: [],
      verdict: null,
      error: null,
      activeAgent: null,
    });

    abortRef.current = streamAnalysis(
      params,
      (event: SSEEvent) => {
        setState((prev) => {
          const next = { ...prev };

          switch (event.type) {
            case "agent_start":
              next.status = "streaming";
              next.activeAgent = event.agent ?? null;
              break;

            case "agent_update":
              if (event.agent && event.data) {
                next.agents = { ...next.agents, [event.agent]: event.data };
              }
              break;

            case "agent_complete":
              if (event.agent && event.data) {
                next.agents = { ...next.agents, [event.agent]: event.data };
              }
              next.activeAgent = null;
              break;

            case "debate_message":
              if (event.debate) {
                next.debate = [...next.debate, event.debate];
              }
              break;

            case "verdict":
              if (event.verdict) {
                next.verdict = event.verdict;
              }
              break;

            case "error":
              next.error = event.error ?? "An error occurred";
              next.status = "error";
              break;

            case "complete":
              next.status = "complete";
              // Save to localStorage if we have results
              if (event.results) {
                saveReport(event.results);
              }
              break;
          }

          return next;
        });
      },
      (error: Error) => {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: error.message,
          activeAgent: null,
        }));
      },
      () => {
        setState((prev) => ({
          ...prev,
          status: "complete",
          activeAgent: null,
        }));
      }
    );
  }, []);

  const cancelAnalysis = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, status: "idle", activeAgent: null }));
  }, []);

  const resetAnalysis = useCallback(() => {
    abortRef.current?.abort();
    setState({
      status: "idle",
      agents: {},
      decision: null,
      debate: [],
      verdict: null,
      error: null,
      activeAgent: null,
    });
  }, []);

  return { state, startAnalysis, cancelAnalysis, resetAnalysis };
}
