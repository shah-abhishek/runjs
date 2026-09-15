import { useState } from "react";
import type { SandboxMessage } from "../lib/messageTypes";
import { PreviewFrame } from "./PreviewFrame";

type TabId = "preview" | "console" | "assets" | "keys";

const TABS: { id: TabId; label: string; enabled: boolean }[] = [
  { id: "preview", label: "Preview", enabled: true },
  { id: "console", label: "Console", enabled: true },
  { id: "assets", label: "Assets", enabled: false },
  { id: "keys", label: "Keys", enabled: false },
];

interface Props {
  srcDoc: string;
  runId: number;
  logs: SandboxMessage[];
  onMessage: (msg: SandboxMessage) => void;
  sandboxAttribute: string;
}

function formatArg(a: unknown): string {
  if (typeof a === "string") return a;
  if (a === null) return "null";
  if (a === undefined) return "undefined";
  if (Array.isArray(a)) return `[${a.map(formatArg).join(", ")}]`;
  if (typeof a === "object") {
    try {
      return JSON.stringify(a, null, 1).replace(/\n\s*/g, " ");
    } catch {
      return String(a);
    }
  }
  return String(a);
}

export function RightPanel({ srcDoc, runId, logs, onMessage, sandboxAttribute }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("console");

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0">
        <div className={`h-full ${activeTab === "preview" ? "block" : "hidden"}`}>
          <PreviewFrame srcDoc={srcDoc} onMessage={onMessage} runId={runId} sandboxAttribute={sandboxAttribute} />
        </div>

        <div
          className={`h-full overflow-auto px-4 pt-3.5 pb-16 font-mono text-[12.5px] leading-[1.7]
                      bg-paper-sunken dark:bg-sunken ${activeTab === "console" ? "block" : "hidden"}`}
        >
          {logs.length === 0 ? (
            <p className="text-paper-muted dark:text-muted">Write some code and press Run to see output here.</p>
          ) : (
            logs.map((l, i) => {
              const level = l.type === "error" ? "error" : (l as any).level ?? "log";
              const marker = level === "error" ? "✕" : level === "warn" ? "!" : "›";
              const tone =
                level === "error"
                  ? "text-paper-alert dark:text-alert"
                  : level === "warn"
                    ? "text-paper-signal dark:text-signal"
                    : "text-paper-fg dark:text-fg";

              return (
                <div key={i} className={`flex gap-2.5 py-0.5 ${tone}`}>
                  <span className="w-3 shrink-0 opacity-60 text-paper-muted dark:text-muted">{marker}</span>
                  <span className="break-all">
                    {l.type === "error" ? l.message : (l as any).args.map(formatArg).join(" ")}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div
        className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex gap-0.5 p-0.5 rounded-lg
                   border border-paper-hairline dark:border-hairline
                   bg-paper-raised/90 dark:bg-raised/90 backdrop-blur-md"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            disabled={!tab.enabled}
            onClick={() => setActiveTab(tab.id)}
            className={`font-mono text-[11px] rounded-md px-3.5 py-1.5 transition
              ${activeTab === tab.id
                ? "text-paper-fg dark:text-fg bg-paper-sunken dark:bg-sunken"
                : "text-paper-muted dark:text-muted"}
              ${tab.enabled ? "cursor-pointer hover:text-paper-fg dark:hover:text-fg" : "opacity-35 cursor-not-allowed"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}