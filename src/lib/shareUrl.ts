import type { LanguageMode, TargetVersion } from "../types/modes";

export interface ShareState {
  files: Record<string, string>;
  entry: string;
  mode: LanguageMode;
  target: TargetVersion;
}

export function encodeShareState(state: ShareState): string {
  return btoa(encodeURIComponent(JSON.stringify(state)));
}

export function decodeShareState(encoded: string): ShareState | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(encoded)));
    if (!parsed?.files || !parsed?.entry) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildShareUrl(state: ShareState): string {
  const url = new URL(window.location.href);
  url.searchParams.set("code", encodeShareState(state));
  return url.toString();
}