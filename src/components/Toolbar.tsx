// src/components/Toolbar.tsx
import type { LanguageMode, TargetVersion, Theme } from "../types/modes";
import { TARGET_VERSION_LABELS } from "../types/modes";
import type { ThemeTokens } from "../lib/themeTokens";

interface Props {
  mode: LanguageMode;
  target: TargetVersion;
  theme: Theme;
  tokens: ThemeTokens;
  onModeChange: (m: LanguageMode) => void;
  onTargetChange: (t: TargetVersion) => void;
  onThemeChange: (t: Theme) => void;
  onRun: () => void;
}

const MODE_LABELS: Record<LanguageMode, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React (JSX)",
  "react-ts": "React (TSX)",
  jquery: "jQuery",
};

// src/components/Toolbar.tsx
export function Toolbar({ mode, target, theme, onModeChange, onTargetChange, onThemeChange, onRun, onFormat }: Props) {
  const selectCls =
    "appearance-none font-mono text-xs rounded-md border px-3 py-1.5 pr-7 cursor-pointer " +
    "bg-paper-sunken border-paper-hairline text-paper-fg " +
    "dark:bg-sunken dark:border-hairline dark:text-fg " +
    "hover:border-paper-muted dark:hover:border-muted " +
    "focus-visible:outline-2 focus-visible:outline-paper-signal dark:focus-visible:outline-signal";

  return (
    <div className="flex items-center gap-2 h-[46px] px-3 bg-paper-raised dark:bg-raised border-b border-paper-hairline dark:border-hairline">
      <select className={selectCls} value={mode} onChange={(e) => onModeChange(e.target.value as LanguageMode)}>
        {Object.entries(MODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>

      <select className={selectCls} value={target} onChange={(e) => onTargetChange(e.target.value as TargetVersion)}>
        {Object.entries(TARGET_VERSION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>

      <button
        onClick={onRun}
        className="inline-flex items-center gap-2 text-[13px] font-semibold rounded-md px-4 py-1.5 cursor-pointer
                   bg-paper-signal text-white dark:bg-signal dark:text-ink
                   hover:brightness-110 active:translate-y-px transition"
      >
        Run
        <kbd className="font-mono text-[10px] opacity-65 border border-current rounded px-1">⌘↵</kbd>
      </button>

      <button onClick={onFormat} className="text-xs rounded-md border px-3 py-1.5 cursor-pointer text-paper-muted dark:text-muted border-paper-hairline dark:border-hairline hover:text-paper-fg dark:hover:text-fg transition">
        Format
      </button>

      <button
        onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
        className="ml-auto text-xs rounded-md border px-3 py-1.5 cursor-pointer text-paper-muted dark:text-muted border-paper-hairline dark:border-hairline hover:text-paper-fg dark:hover:text-fg transition"
      >
        {theme === "dark" ? "Light theme" : "Dark theme"}
      </button>
    </div>
  );
}