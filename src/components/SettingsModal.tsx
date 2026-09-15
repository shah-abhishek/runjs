import { useState } from "react";
import type { SandboxPermissions, EditorPreferences, ExecutionSettings } from "../types/modes";

type SettingsTab = "sandbox" | "editor" | "execution";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "sandbox", label: "Sandbox" },
  { id: "editor", label: "Editor" },
  { id: "execution", label: "Execution" },
];

const SANDBOX_TOGGLES: { key: keyof SandboxPermissions; label: string; hint: string }[] = [
  { key: "modals", label: "Allow alert, confirm and prompt", hint: "Code using browser dialogs needs this" },
  { key: "popups", label: "Allow opening new tabs and windows", hint: "Needed for window.open or target=_blank links" },
  { key: "forms", label: "Allow form submission", hint: "Needed to test form behaviour" },
  { key: "downloads", label: "Allow file downloads", hint: "Needed if your code triggers a download" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  permissions: SandboxPermissions;
  onPermissionsChange: (p: SandboxPermissions) => void;
  editorPrefs: EditorPreferences;
  onEditorPrefsChange: (p: EditorPreferences) => void;
  execution: ExecutionSettings;
  onExecutionChange: (e: ExecutionSettings) => void;
}

export function SettingsModal({
  open, onClose,
  permissions, onPermissionsChange,
  editorPrefs, onEditorPrefsChange,
  execution, onExecutionChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("sandbox");

  if (!open) return null;

  const rowCls = "flex gap-3 py-3 border-t border-paper-hairline dark:border-hairline first-of-type:border-t-0 cursor-pointer";
  const fieldLabelCls = "flex justify-between font-mono text-xs mb-2 text-paper-muted dark:text-muted";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 grid place-items-center bg-[rgba(10,16,22,0.6)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Settings"
        className="w-[600px] max-w-[90vw] rounded-[10px] overflow-hidden
                   bg-paper-raised dark:bg-raised text-paper-fg dark:text-fg
                   border border-paper-hairline dark:border-hairline"
      >
        <div className="flex justify-between items-center px-5 pt-4">
          <h2 className="m-0 text-[15px] font-semibold">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="text-lg leading-none cursor-pointer bg-transparent border-0 text-paper-muted dark:text-muted hover:text-paper-fg dark:hover:text-fg"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-5 px-5 pt-3.5 border-b border-paper-hairline dark:border-hairline">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-xs pb-2.5 border-b-2 cursor-pointer bg-transparent transition
                ${activeTab === tab.id
                  ? "text-paper-fg dark:text-fg border-paper-signal dark:border-signal"
                  : "text-paper-muted dark:text-muted border-transparent"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-5 py-5 max-h-[460px] overflow-y-auto">
          {activeTab === "sandbox" && (
            <>
              <p className="text-[13px] mb-3 text-paper-muted dark:text-muted">
                Controls what your code is allowed to do while it runs. Code always runs in an isolated sandbox regardless of these settings.
              </p>
              {SANDBOX_TOGGLES.map(({ key, label, hint }) => (
                <label key={key} className={rowCls}>
                  <input
                    type="checkbox"
                    checked={permissions[key]}
                    onChange={() => onPermissionsChange({ ...permissions, [key]: !permissions[key] })}
                    className="mt-1 accent-paper-signal dark:accent-signal"
                  />
                  <span>
                    <span className="block text-[13.5px]">{label}</span>
                    <span className="block text-xs mt-0.5 text-paper-muted dark:text-muted">{hint}</span>
                  </span>
                </label>
              ))}
            </>
          )}

          {activeTab === "editor" && (
            <>
              <div className="mb-5">
                <span className={fieldLabelCls}>
                  Font size <b className="font-medium text-paper-fg dark:text-fg">{editorPrefs.fontSize}px</b>
                </span>
                <input
                  type="range" min={10} max={24} value={editorPrefs.fontSize}
                  onChange={(e) => onEditorPrefsChange({ ...editorPrefs, fontSize: Number(e.target.value) })}
                  className="w-full accent-paper-signal dark:accent-signal"
                />
              </div>

              <div className="mb-5">
                <span className={fieldLabelCls}>
                  Tab size <b className="font-medium text-paper-fg dark:text-fg">{editorPrefs.tabSize} spaces</b>
                </span>
                <input
                  type="range" min={2} max={8} step={2} value={editorPrefs.tabSize}
                  onChange={(e) => onEditorPrefsChange({ ...editorPrefs, tabSize: Number(e.target.value) })}
                  className="w-full accent-paper-signal dark:accent-signal"
                />
              </div>

              <label className="flex gap-3 items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editorPrefs.wordWrap}
                  onChange={(e) => onEditorPrefsChange({ ...editorPrefs, wordWrap: e.target.checked })}
                  className="accent-paper-signal dark:accent-signal"
                />
                <span className="text-[13.5px]">Wrap long lines</span>
              </label>
            </>
          )}

          {activeTab === "execution" && (
            <>
              <div className="mb-5">
                <span className={fieldLabelCls}>
                  Stop after <b className="font-medium text-paper-fg dark:text-fg">{execution.timeoutMs / 1000}s</b>
                </span>
                <input
                  type="range" min={1000} max={15000} step={1000} value={execution.timeoutMs}
                  onChange={(e) => onExecutionChange({ ...execution, timeoutMs: Number(e.target.value) })}
                  className="w-full accent-paper-signal dark:accent-signal"
                />
                <p className="text-xs mt-1.5 text-paper-muted dark:text-muted">
                  If code hasn't finished by then, the preview resets so the app stays responsive. Code already running in the sandbox isn't forcibly stopped.
                </p>
              </div>

              <label className="flex gap-3 items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={execution.autoRunOnChange}
                  onChange={(e) => onExecutionChange({ ...execution, autoRunOnChange: e.target.checked })}
                  className="accent-paper-signal dark:accent-signal"
                />
                <span className="text-[13.5px]">Run automatically as you type</span>
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}