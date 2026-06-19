import { useState } from "react";
import { Key, X, Eye, EyeOff, ExternalLink } from "lucide-react";

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  currentKey: string;
  onSave: (key: string) => void;
}

export default function ApiKeyModal({ open, onClose, currentKey, onSave }: ApiKeyModalProps) {
  const [key, setKey] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    onSave(key.trim());
    onClose();
  };

  const isValidFormat = key.trim().length > 10;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-xl border border-border-light bg-surface-elevated p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-research-dim">
                <Key className="h-4 w-4 text-research" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">OpenRouter API Key</h2>
                <p className="text-[11px] text-muted">Your key stays on this device</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Key Input */}
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full rounded-lg border border-border-light bg-surface-card py-2.5 pl-3 pr-10 text-xs text-foreground placeholder-muted outline-none transition-all duration-200 focus:border-primary/40"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>

          {key.trim() && !isValidFormat && (
            <p className="mt-1.5 text-[10px] text-risk">Key seems too short — check it's correct</p>
          )}

          {/* Get key link */}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1 text-[10px] text-research transition-colors hover:text-research/80"
          >
            <ExternalLink className="h-3 w-3" />
            Get your OpenRouter API key (free credits available)
          </a>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-border-light px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!key.trim() || !isValidFormat}
              className="cursor-pointer rounded-lg bg-gradient-to-r from-research to-secondary px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </>
  );
}