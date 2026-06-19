import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface HeroInputProps {
  onAnalyze: (params: {
    startupName: string;
    investmentAmount: number;
    riskPreference: string;
  }) => void;
  loading: boolean;
}

export default function HeroInput({ onAnalyze, loading }: HeroInputProps) {
  const [startupName, setStartupName] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(500000);
  const [riskPreference, setRiskPreference] = useState("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupName.trim() || loading) return;
    onAnalyze({
      startupName: startupName.trim(),
      investmentAmount,
      riskPreference,
    });
  };

  const formatAmount = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-muted" />
          <input
            type="text"
            value={startupName}
            onChange={(e) => setStartupName(e.target.value)}
            placeholder="Analyze a startup..."
            className="w-full rounded-xl border border-border-light bg-surface-card py-3.5 pl-11 pr-32 text-sm text-foreground placeholder-muted outline-none transition-all duration-200 focus:border-primary/40 focus:shadow-glow-blue"
            disabled={loading}
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted transition-colors duration-200 hover:text-foreground"
            >
              <SlidersHorizontal className={`h-3.5 w-3.5 transition-transform duration-200 ${showOptions ? "rotate-90" : ""}`} />
            </button>
            <button
              type="submit"
              disabled={!startupName.trim() || loading}
              className="cursor-pointer rounded-lg bg-gradient-to-r from-research to-secondary px-4 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {showOptions && (
          <div className="mt-3 rounded-xl border border-border-light bg-surface-card p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted">Options</span>
              <button
                type="button"
                onClick={() => setShowOptions(false)}
                className="cursor-pointer text-muted hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-muted">
                  Investment Amount: <span className="font-mono text-foreground">{formatAmount(investmentAmount)}</span>
                </label>
                <input
                  type="range"
                  min={100000}
                  max={10000000}
                  step={100000}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-full accent-research"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>$100K</span>
                  <span>$10M</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted">Risk Preference</label>
                <div className="flex gap-2">
                  {["low", "medium", "high"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRiskPreference(r)}
                      className={`cursor-pointer flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        riskPreference === r
                          ? "border-research/50 bg-research-dim text-research"
                          : "border-border-light text-muted hover:border-border hover:text-foreground"
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}