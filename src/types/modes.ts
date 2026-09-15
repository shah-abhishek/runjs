// src/types/modes.ts
export type LanguageMode = "javascript" | "typescript" | "react" | "react-ts" | "jquery";

export type TargetVersion = "node14" | "node16" | "node18" | "node20" | "node22" | "es2026";

export type Theme = "dark" | "light";

export const TARGET_VERSION_LABELS: Record<TargetVersion, string> = {
  node14: "Node 14",
  node16: "Node 16",
  node18: "Node 18",
  node20: "Node 20",
  node22: "Node 22",
  es2026: "ES2026 (Latest)",
};

export interface SandboxPermissions {
  modals: boolean;   // alert/confirm/prompt
  popups: boolean;   // window.open
  forms: boolean;    // form submission
  downloads: boolean; // file downloads
}

export const DEFAULT_SANDBOX_PERMISSIONS: SandboxPermissions = {
  modals: true,
  popups: false,
  forms: true,
  downloads: false,
};

// src/types/modes.ts (add to existing file)
export interface EditorPreferences {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
}

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: false,
};

export interface ExecutionSettings {
  timeoutMs: number;
  autoRunOnChange: boolean;
}

export const DEFAULT_EXECUTION_SETTINGS: ExecutionSettings = {
  timeoutMs: 5000,
  autoRunOnChange: false,
};