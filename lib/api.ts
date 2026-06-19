import type { SSEEvent, AgentId, AgentOutput, DebateRound, Verdict, AnalysisResult } from "../types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";

// ─── Agent system prompts ───────────────────────────────────────────

const AGENT_PROMPTS: Record<AgentId, string> = {
  research: `You are a Research Analyst evaluating a startup. Respond ONLY with valid JSON.

Analyze the startup's:
- Founding team (experience, track record, domain expertise)
- Product/technology (innovation, defensibility, stage)
- Business model (revenue model, unit economics, scalability)
- Traction (users, revenue, partnerships, growth rate)

Return JSON with:
{
  "summary": "2-3 sentence executive summary of findings",
  "score": { "overall": <0-10>, "breakdown": { "team": <0-10>, "product": <0-10>, "business_model": <0-10>, "traction": <0-10> } },
  "analysis": ["key finding 1", "key finding 2", ...],
  "red_flags": ["concern 1", ...],
  "citations": ["source 1", ...]
}`,

  market: `You are a Market Analyst evaluating a startup. Respond ONLY with valid JSON.

Analyze the startup's market:
- Market size (TAM, SAM, SOM) and growth rate
- Competitive landscape (direct & indirect competitors, moats)
- Market positioning (differentiation, brand, network effects)
- Customer segments and adoption trends

Return JSON with:
{
  "summary": "2-3 sentence executive summary of market findings",
  "score": { "overall": <0-10>, "breakdown": { "tam": <0-10>, "competition": <0-10>, "positioning": <0-10>, "growth": <0-10> } },
  "analysis": ["key finding 1", "key finding 2", ...],
  "red_flags": ["concern 1", ...],
  "citations": ["source 1", ...]
}`,

  finance: `You are a Financial Analyst evaluating a startup. Respond ONLY with valid JSON.

Analyze the startup's financial profile:
- Revenue and revenue growth trajectory
- Burn rate and runway (estimated based on industry standards)
- Valuation expectations and funding history
- Unit economics (CAC, LTV, gross margins where inferable)

Return JSON with:
{
  "summary": "2-3 sentence executive summary of financial findings",
  "score": { "overall": <0-10>, "breakdown": { "revenue": <0-10>, "growth": <0-10>, "unit_economics": <0-10>, "funding": <0-10> } },
  "analysis": ["key finding 1", "key finding 2", ...],
  "red_flags": ["concern 1", ...],
  "citations": ["source 1", ...]
}`,

  risk: `You are a Risk Assessment Specialist evaluating a startup. Respond ONLY with valid JSON.

Identify and evaluate:
- Market risks (competition, regulatory, macroeconomic)
- Technology risks (feasibility, IP challenges, obsolescence)
- Team risks (founder dynamics, hiring challenges, key-person risk)
- Financial risks (cash position, valuation risk, dilution)
- Execution risks (timeline, scaling challenges)

IMPORTANT: If you identify a critical deal-breaking risk, set "veto": true and explain the veto_reason.

Return JSON with:
{
  "summary": "2-3 sentence risk overview",
  "score": { "overall": <0-10 where 10=no risk>, "breakdown": { "market_risk": <0-10>, "tech_risk": <0-10>, "team_risk": <0-10>, "financial_risk": <0-10> } },
  "analysis": ["risk finding 1", "risk finding 2", ...],
  "red_flags": ["critical concern 1", ...],
  "veto": false,
  "veto_reason": ""
}`,
};

// ─── OpenRouter streaming helper ────────────────────────────────────

async function streamOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  signal: AbortSignal,
  onToken: (token: string) => void
): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "InvestiBand",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      response_format: { type: "json_object" },
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenRouter error ${response.status}: ${text || response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body from OpenRouter");

  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload);
        const content = parsed?.choices?.[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          onToken(content);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return fullContent;
}

// ─── Parse agent JSON safely ────────────────────────────────────────

function parseAgentOutput(raw: string, agent: AgentId): AgentOutput {
  // Try to extract JSON from markdown code blocks if present
  let jsonStr = raw.trim();
  const codeMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();

  const parsed = JSON.parse(jsonStr);

  return {
    agent,
    summary: parsed.summary || "",
    score: {
      overall: parsed.score?.overall ?? 5,
      breakdown: parsed.score?.breakdown || {},
    },
    analysis: Array.isArray(parsed.analysis) ? parsed.analysis : [],
    red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags : [],
    citations: Array.isArray(parsed.citations) ? parsed.citations : undefined,
    veto: !!parsed.veto,
    veto_reason: parsed.veto_reason || undefined,
  };
}

// ─── Debate generation ──────────────────────────────────────────────

const DEBATE_PAIRS: [AgentId, AgentId][] = [
  ["finance", "market"],
  ["risk", "research"],
  ["market", "finance"],
  ["research", "risk"],
];

async function generateDebateRound(
  from: AgentId,
  to: AgentId,
  fromOutput: AgentOutput,
  toOutput: AgentOutput,
  apiKey: string,
  signal: AbortSignal
): Promise<DebateRound> {
  const prompt = `You are the ${from.toUpperCase()} agent. Based on YOUR analysis and the ${to.toUpperCase()} agent's analysis below, ask ONE pointed question challenging their findings or assumptions.

YOUR analysis summary: ${fromOutput.summary}
${to.toUpperCase()} agent's analysis summary: ${toOutput.summary}
${to.toUpperCase()} agent's red flags: ${toOutput.red_flags.join("; ")}

Respond with ONLY a JSON object: { "question": "your challenging question here" }`;

  const questionContent = await streamOpenRouter(
    `You are a ${from} agent in a startup investment debate. Respond ONLY with valid JSON.`,
    prompt,
    apiKey,
    signal,
    () => {}
  );

  let questionJson;
  try {
    const match = questionContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    questionJson = JSON.parse(match ? match[1].trim() : questionContent.trim());
  } catch {
    questionJson = { question: questionContent.slice(0, 200) };
  }

  const question = questionJson.question || questionContent.slice(0, 200);

  const responsePrompt = `You are the ${to.toUpperCase()} agent. You are being challenged by the ${from.toUpperCase()} agent.

Question from ${from.toUpperCase()}: "${question}"

YOUR analysis summary: ${toOutput.summary}
Your key points: ${toOutput.analysis.join("; ")}

Respond with ONLY a JSON object: { "response": "your defense/rebuttal here (2-3 sentences)" }`;

  const responseContent = await streamOpenRouter(
    `You are a ${to} agent defending your analysis. Respond ONLY with valid JSON.`,
    responsePrompt,
    apiKey,
    signal,
    () => {}
  );

  let responseJson;
  try {
    const match = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    responseJson = JSON.parse(match ? match[1].trim() : responseContent.trim());
  } catch {
    responseJson = { response: responseContent.slice(0, 300) };
  }

  return {
    from_agent: from,
    to_agent: to,
    message: question,
    response: responseJson.response || responseContent.slice(0, 300),
  };
}

// ─── Verdict generation ─────────────────────────────────────────────

async function generateVerdict(
  agents: Partial<Record<AgentId, AgentOutput>>,
  startupName: string,
  investmentAmount: number | null,
  riskPreference: string | null,
  apiKey: string,
  signal: AbortSignal
): Promise<{ verdict: Verdict; decision: AgentOutput }> {
  const agentSummaries = Object.entries(agents)
    .map(([id, out]) => `${id.toUpperCase()}:\nSummary: ${out!.summary}\nScore: ${out!.score.overall}/10\nRed Flags: ${out!.red_flags.join("; ")}`)
    .join("\n\n");

  const prompt = `You are the Decision Agent synthesizing a startup investment analysis.

Startup: ${startupName}
Investment Amount: ${investmentAmount ? `$${investmentAmount.toLocaleString()}` : "Not specified"}
Risk Preference: ${riskPreference || "Medium"}

Agent Findings:
${agentSummaries}

Based on ALL agent analyses, produce a final investment verdict. Return ONLY valid JSON:

{
  "verdict": {
    "decision": "INVEST" | "AVOID" | "WAIT",
    "confidence_score": <0-100>,
    "summary": "2-3 sentence final recommendation",
    "scores": {
      "team": <0-10>,
      "market": <0-10>,
      "finance": <0-10>,
      "risk": <0-10>
    }
  },
  "decision_summary": "2-3 sentence rationale for the decision",
  "decision_score": { "overall": <0-10>, "breakdown": {} }
}`;

  const content = await streamOpenRouter(
    `You are a senior investment decision-maker. Respond ONLY with valid JSON.`,
    prompt,
    apiKey,
    signal,
    () => {}
  );

  let parsed;
  try {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    parsed = JSON.parse(match ? match[1].trim() : content.trim());
  } catch {
    throw new Error("Failed to parse verdict from OpenRouter response");
  }

  const v = parsed.verdict || parsed;

  const verdict: Verdict = {
    decision: v.decision || "WAIT",
    confidence_score: v.confidence_score ?? 50,
    summary: v.summary || parsed.decision_summary || "",
    scores: {
      team: v.scores?.team ?? 5,
      market: v.scores?.market ?? 5,
      finance: v.scores?.finance ?? 5,
      risk: v.scores?.risk ?? 5,
    },
  };

  const decision: AgentOutput = {
    agent: "decision",
    summary: parsed.decision_summary || verdict.summary,
    score: parsed.decision_score || { overall: verdict.confidence_score / 10, breakdown: {} },
    analysis: [verdict.summary],
    red_flags: [],
  };

  return { verdict, decision };
}

// ─── Main orchestration function ────────────────────────────────────

export function streamAnalysis(
  params: { startupName: string; investmentAmount?: number; riskPreference?: string; apiKey: string },
  onEvent: (event: SSEEvent) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): AbortController {
  const controller = new AbortController();
  const { signal } = controller;

  const run = async () => {
    try {
      const { startupName, investmentAmount, riskPreference, apiKey } = params;

      // Phase 1: Run all 4 agents in parallel
      const agentEntries = Object.keys(AGENT_PROMPTS) as AgentId[];

      // Emit start for all agents
      for (const agent of agentEntries) {
        onEvent({ type: "agent_start", agent });
      }

      const userPrompt = `Analyze the startup: "${startupName}"

Investment amount: ${investmentAmount ? `$${investmentAmount.toLocaleString()}` : "Not specified"}
Risk preference: ${riskPreference || "Medium"}

Provide a thorough analysis based on publicly available information about this startup. If it's a well-known startup, use your knowledge. If it's a less-known or fictional startup, make reasonable assumptions based on the industry/sector implied by the name and provide a realistic analysis.`;

      const agentResults = await Promise.all(
        agentEntries.map(async (agent) => {
          const rawContent = await streamOpenRouter(
            AGENT_PROMPTS[agent],
            userPrompt,
            apiKey,
            signal,
            () => {} // We don't stream intermediate tokens for agents
          );

          const output = parseAgentOutput(rawContent, agent);
          onEvent({ type: "agent_complete", agent, data: output });
          return { agent, output };
        })
      );

      // Build agents map
      const agentsMap: Partial<Record<AgentId, AgentOutput>> = {};
      for (const { agent, output } of agentResults) {
        agentsMap[agent] = output;
      }

      // Phase 2: Debate
      const debate: DebateRound[] = [];
      for (const [from, to] of DEBATE_PAIRS) {
        if (signal.aborted) return;
        const fromOut = agentsMap[from];
        const toOut = agentsMap[to];
        if (!fromOut || !toOut) continue;

        const round = await generateDebateRound(from, to, fromOut, toOut, apiKey, signal);
        debate.push(round);
        onEvent({ type: "debate_message", debate: round });
      }

      // Phase 3: Verdict
      if (signal.aborted) return;
      const { verdict, decision } = await generateVerdict(
        agentsMap,
        startupName,
        investmentAmount ?? null,
        riskPreference ?? null,
        apiKey,
        signal
      );
      onEvent({ type: "verdict", verdict });

      // Phase 4: Complete
      const result: AnalysisResult = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        startup_name: startupName,
        investment_amount: investmentAmount ?? null,
        risk_preference: riskPreference ?? null,
        agents: agentsMap,
        decision,
        debate,
        verdict,
        created_at: new Date().toISOString(),
      };

      onEvent({ type: "complete", results: result });
      onComplete();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  run();
  return controller;
}

// ─── Synchronous helpers for report fetching ────────────────────────

export { getAllReports as fetchReports, getReportById as fetchReport } from "./storage";
