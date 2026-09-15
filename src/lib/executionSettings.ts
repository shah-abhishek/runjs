// src/lib/executionSettings.ts
import type { ExecutionSettings } from "../types/modes";
import { DEFAULT_EXECUTION_SETTINGS } from "../types/modes";

const KEY = "compiler-execution-settings";

export function getInitialExecutionSettings(): ExecutionSettings {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return DEFAULT_EXECUTION_SETTINGS;
    return { ...DEFAULT_EXECUTION_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_EXECUTION_SETTINGS;
  }
}

export function persistExecutionSettings(settings: ExecutionSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}