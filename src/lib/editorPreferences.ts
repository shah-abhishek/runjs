// src/lib/editorPreferences.ts
import type { EditorPreferences } from "../types/modes";
import { DEFAULT_EDITOR_PREFERENCES } from "../types/modes";

const KEY = "compiler-editor-preferences";

export function getInitialEditorPreferences(): EditorPreferences {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return DEFAULT_EDITOR_PREFERENCES;
    return { ...DEFAULT_EDITOR_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_EDITOR_PREFERENCES;
  }
}

export function persistEditorPreferences(prefs: EditorPreferences): void {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}