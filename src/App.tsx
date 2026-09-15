import { useCallback, useEffect, useRef, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Editor } from "./components/Editor";
import { Toolbar } from "./components/Toolbar";
import { FileTabs } from "./components/FileTabs";
import { RightPanel } from "./components/RightPanel";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { SettingsModal } from "./components/SettingsModal";
import { transformFile } from "./lib/babelTransform";
import { buildSandboxDoc } from "./lib/buildSandboxDoc";
import { buildSandboxAttribute, getInitialPermissions, persistPermissions } from "./lib/sandboxPermissions";
import { getInitialEditorPreferences, persistEditorPreferences } from "./lib/editorPreferences";
import { getInitialExecutionSettings, persistExecutionSettings } from "./lib/executionSettings";
import { getInitialTheme, persistTheme, applyTheme } from "./lib/themeTokens";
import { formatCode } from "./lib/formatCode";
import { decodeShareState } from "./lib/shareUrl";
import { STARTER_PROJECTS } from "./lib/starterProjects";
import type { SandboxMessage } from "./lib/messageTypes";
import type { LanguageMode, TargetVersion, Theme, SandboxPermissions, EditorPreferences, ExecutionSettings } from "./types/modes";

const shared = (() => {
  const encoded = new URLSearchParams(window.location.search).get("code");
  return encoded ? decodeShareState(encoded) : null;
})();

export default function App() {
  const initial = shared ?? { ...STARTER_PROJECTS.javascript, mode: "javascript" as LanguageMode, target: "es2026" as TargetVersion };

  const [files, setFiles] = useState<Record<string, string>>(initial.files);
  const [entry, setEntry] = useState(initial.entry);
  const [activeFile, setActiveFile] = useState(initial.entry);
  const [mode, setMode] = useState<LanguageMode>(initial.mode);
  const [target, setTarget] = useState<TargetVersion>(initial.target);

  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [permissions, setPermissions] = useState<SandboxPermissions>(() => getInitialPermissions());
  const [editorPrefs, setEditorPrefs] = useState<EditorPreferences>(() => getInitialEditorPreferences());
  const [execution, setExecution] = useState<ExecutionSettings>(() => getInitialExecutionSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [srcDoc, setSrcDoc] = useState("");
  const [runId, setRunId] = useState(0);
  const [logs, setLogs] = useState<SandboxMessage[]>([]);
  const [lastRunMs, setLastRunMs] = useState<number | null>(null);

  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => { persistTheme(theme); applyTheme(theme); }, [theme]);
  useEffect(() => { persistPermissions(permissions); }, [permissions]);
  useEffect(() => { persistEditorPreferences(editorPrefs); }, [editorPrefs]);
  useEffect(() => { persistExecutionSettings(execution); }, [execution]);

  const handleRun = useCallback(() => {
    setLogs([]);
    setLastRunMs(null);
    try {
      const transformed: Record<string, string> = {};
      for (const [name, content] of Object.entries(files)) {
        transformed[name] = transformFile(content, name, target);
      }

      startedAtRef.current = performance.now();
      setSrcDoc(buildSandboxDoc(
        transformed,
        entry,
        mode === "react" || mode === "react-ts",
        mode === "jquery",
      ));
      setRunId((id) => id + 1);

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setLogs((prev) => [...prev, {
          type: "error",
          message: `Code didn't finish within ${execution.timeoutMs / 1000}s. The preview was reset.`,
        }]);
        setSrcDoc("");
        setRunId((id) => id + 1);
      }, execution.timeoutMs);
    } catch (err) {
      setLogs([{ type: "error", message: (err as Error).message }]);
    }
  }, [files, entry, mode, target, execution.timeoutMs]);

  const handleMessage = useCallback((msg: SandboxMessage) => {
    if (msg.type === "ready") return;
    if (msg.type === "execution-complete") {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setLastRunMs(Math.round(performance.now() - startedAtRef.current));
      return;
    }
    setLogs((prev) => [...prev, msg]);
  }, []);

  const handleModeChange = useCallback((next: LanguageMode) => {
    const untouched = Object.entries(files).every(
      ([name, content]) => STARTER_PROJECTS[mode].files[name] === content,
    );
    setMode(next);
    if (untouched) {
      const project = STARTER_PROJECTS[next];
      setFiles(project.files);
      setEntry(project.entry);
      setActiveFile(project.entry);
    }
  }, [files, mode]);

  const handleFormat = useCallback(async () => {
    try {
      const formatted = await formatCode(files[activeFile], activeFile);
      setFiles((prev) => ({ ...prev, [activeFile]: formatted }));
    } catch (err) {
      setLogs((prev) => [...prev, { type: "error", message: `Couldn't format: ${(err as Error).message}` }]);
    }
  }, [files, activeFile]);

  const handleAddFile = useCallback((name: string) => {
    setFiles((prev) => ({ ...prev, [name]: "" }));
    setActiveFile(name);
  }, []);

  const handleDeleteFile = useCallback((name: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setActiveFile((current) => (current === name ? entry : current));
  }, [entry]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleRun]);

  useEffect(() => {
    if (!execution.autoRunOnChange) return;
    const t = window.setTimeout(handleRun, 700);
    return () => window.clearTimeout(t);
  }, [files, execution.autoRunOnChange, handleRun]);

  const errorCount = logs.filter((l) => l.type === "error").length;

  return (
    <div className="flex h-screen w-full font-ui bg-paper dark:bg-ink text-paper-fg dark:text-fg">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex flex-col flex-1 min-w-0">
        <Toolbar
          mode={mode}
          target={target}
          theme={theme}
          onModeChange={handleModeChange}
          onTargetChange={setTarget}
          onThemeChange={setTheme}
          onRun={handleRun}
          onFormat={handleFormat}
        />

        <Group orientation="horizontal" className="flex-1 min-h-0">
          <Panel defaultSize={50} minSize={20}>
            <div className="flex flex-col h-full">
              <FileTabs
                files={files}
                activeFile={activeFile}
                entry={entry}
                onSelect={setActiveFile}
                onAdd={handleAddFile}
                onDelete={handleDeleteFile}
              />
              <div className="flex-1 min-h-0">
                <Editor
                  path={activeFile}
                  value={files[activeFile] ?? ""}
                  onChange={(v) => setFiles((prev) => ({ ...prev, [activeFile]: v }))}
                  theme={theme}
                  editorPrefs={editorPrefs}
                />
              </div>
            </div>
          </Panel>

          <Separator className="w-px bg-paper-hairline dark:bg-hairline hover:bg-paper-signal dark:hover:bg-signal transition-colors" />

          <Panel defaultSize={50} minSize={20}>
            <RightPanel
              srcDoc={srcDoc}
              runId={runId}
              logs={logs}
              onMessage={handleMessage}
              sandboxAttribute={buildSandboxAttribute(permissions)}
            />
          </Panel>
        </Group>

        <StatusBar mode={mode} target={target} errorCount={errorCount} lastRunMs={lastRunMs} />
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        permissions={permissions}
        onPermissionsChange={setPermissions}
        editorPrefs={editorPrefs}
        onEditorPrefsChange={setEditorPrefs}
        execution={execution}
        onExecutionChange={setExecution}
      />
    </div>
  );
}