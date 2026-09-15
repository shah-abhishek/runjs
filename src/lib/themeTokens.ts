// src/lib/themeTokens.ts
import type { Theme } from "../types/modes";

const THEME_STORAGE_KEY = "compiler-theme";

export function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function persistTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

export const MONACO_THEME = "instrument";

export function defineMonacoTheme(monaco: typeof import("monaco-editor"), theme: Theme): void {
  monaco.editor.defineTheme(MONACO_THEME, {
    base: theme === "dark" ? "vs-dark" : "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: theme === "dark" ? "5D7488" : "7B8A99", fontStyle: "italic" },
      { token: "string", foreground: theme === "dark" ? "9BD1A0" : "2F6B43" },
      { token: "number", foreground: theme === "dark" ? "F2C14E" : "8A6A12" },
      { token: "keyword", foreground: theme === "dark" ? "7FB3E8" : "1F5C99" },
    ],
    colors: {
      "editor.background": theme === "dark" ? "#16202B" : "#FFFFFF",
      "editorLineNumber.foreground": theme === "dark" ? "#44586B" : "#A8B4C0",
      "editorLineNumber.activeForeground": theme === "dark" ? "#F2C14E" : "#8A6A12",
      "editor.lineHighlightBackground": theme === "dark" ? "#1E2B38" : "#F3F6F9",
    },
  });
}