import { useState } from "react";

interface Props {
  files: Record<string, string>;
  activeFile: string;
  entry: string;
  onSelect: (name: string) => void;
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
}

export function FileTabs({ files, activeFile, entry, onSelect, onAdd, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const names = Object.keys(files);

  const commit = () => {
    const name = draft.trim();
    setAdding(false);
    setDraft("");
    if (!name) return;
    if (files[name]) return;                       // already exists
    if (!/\.(js|jsx|ts|tsx)$/.test(name)) return;  // needs a known extension to pick presets
    onAdd(name);
  };

  return (
    <div className="flex items-stretch gap-px overflow-x-auto bg-paper-raised dark:bg-raised border-b border-paper-hairline dark:border-hairline">
      {names.map((name) => (
        <div
          key={name}
          className={`group flex items-center gap-2 px-3 py-2 font-mono text-xs cursor-pointer whitespace-nowrap border-b-2 transition
            ${name === activeFile
              ? "text-paper-fg dark:text-fg border-paper-signal dark:border-signal bg-paper-sunken dark:bg-sunken"
              : "text-paper-muted dark:text-muted border-transparent hover:text-paper-fg dark:hover:text-fg"}`}
          onClick={() => onSelect(name)}
        >
          {name}
          {name === entry && (
            <span className="text-[9px] uppercase tracking-wide text-paper-signal dark:text-signal">entry</span>
          )}
          {name !== entry && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(name); }}
              aria-label={`Delete ${name}`}
              className="opacity-0 group-hover:opacity-100 text-paper-muted dark:text-muted hover:text-paper-alert dark:hover:text-alert"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") { setAdding(false); setDraft(""); }
          }}
          placeholder="Component.jsx"
          className="w-36 px-2 my-1 font-mono text-xs bg-transparent border border-paper-hairline dark:border-hairline rounded outline-none text-paper-fg dark:text-fg"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          aria-label="Add file"
          className="px-3 font-mono text-sm text-paper-muted dark:text-muted hover:text-paper-fg dark:hover:text-fg"
        >
          +
        </button>
      )}
    </div>
  );
}