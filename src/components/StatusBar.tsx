import type { LanguageMode, TargetVersion } from "../types/modes";
import { TARGET_VERSION_LABELS } from "../types/modes";

interface Props {
  mode: LanguageMode;
  target: TargetVersion;
  errorCount: number;
  lastRunMs: number | null;
}

const MODE_LABELS: Record<LanguageMode, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React (JSX)",
  "react-ts": "React (TSX)",
  jquery: "jQuery",
};

export function StatusBar({ mode, target, errorCount, lastRunMs }: Props) {
  const dot =
    errorCount > 0
      ? "bg-paper-alert dark:bg-alert"
      : lastRunMs !== null
        ? "bg-paper-signal dark:bg-signal"
        : "bg-paper-muted dark:bg-muted";

  const status =
    errorCount > 0
      ? `${errorCount} error${errorCount > 1 ? "s" : ""}`
      : lastRunMs !== null
        ? "Ran cleanly"
        : "Ready";

  return (
    <div className="flex items-center gap-5 h-7 px-3.5 font-mono text-[11px]
                    bg-paper-raised dark:bg-raised border-t border-paper-hairline dark:border-hairline
                    text-paper-muted dark:text-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        {status}
      </span>
      <span>Language <b className="font-medium text-paper-fg dark:text-fg">{MODE_LABELS[mode]}</b></span>
      <span>Target <b className="font-medium text-paper-fg dark:text-fg">{TARGET_VERSION_LABELS[target]}</b></span>
      {lastRunMs !== null && (
        <span>Finished in <b className="font-medium text-paper-fg dark:text-fg">{lastRunMs}ms</b></span>
      )}
    </div>
  );
}