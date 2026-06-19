import { ChartBar, History, Key } from "lucide-react";

interface HeaderProps {
  onHistoryClick: () => void;
  onApiKeyClick: () => void;
  hasApiKey: boolean;
}

export default function Header({ onHistoryClick, onApiKeyClick, hasApiKey }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border-light bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-research to-secondary">
            <ChartBar className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading text-base font-bold tracking-wider text-foreground">
            InvestiBand
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onApiKeyClick}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              hasApiKey
                ? "border-market/30 text-market hover:border-market/50"
                : "border-risk/30 text-risk hover:border-risk/50 animate-pulse"
            }`}
            title={hasApiKey ? "API Key set" : "Add OpenAI API Key"}
          >
            <Key className="h-3.5 w-3.5" />
            {hasApiKey ? "Key Set" : "Set API Key"}
          </button>
          <button
            onClick={onHistoryClick}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-light bg-surface-card px-3 py-1.5 text-xs font-medium text-muted transition-all duration-200 hover:border-border hover:text-foreground hover:bg-surface-hover"
          >
            <History className="h-3.5 w-3.5" />
            History
          </button>
        </div>
      </div>
    </header>
  );
}