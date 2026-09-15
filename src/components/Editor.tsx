import MonacoEditor from "@monaco-editor/react";
import type { EditorPreferences, Theme } from "../types/modes";
import { MONACO_THEME, defineMonacoTheme } from "../lib/themeTokens";

interface Props {
  path: string;
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  editorPrefs: EditorPreferences;
}

function languageFor(path: string): string {
  return /\.tsx?$/.test(path) ? "typescript" : "javascript";
}

export function Editor({ path, value, onChange, theme, editorPrefs }: Props) {
  return (
    <MonacoEditor
      height="100%"
      path={path}                    // separate model per file: undo history + cursor survive tab switches
      language={languageFor(path)}
      value={value}
      theme={MONACO_THEME}
      beforeMount={(monaco) => {
        defineMonacoTheme(monaco, theme);

        const options = {
          jsx: monaco.languages.typescript.JsxEmit.React,
          allowJs: true,
          allowNonTsExtensions: true,
          esModuleInterop: true,
          target: monaco.languages.typescript.ScriptTarget.ESNext,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        };
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions(options);
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions(options);

        const globals = `
          declare const React: any;
          declare const ReactDOM: any;
          declare const $: any;
          declare const jQuery: any;
        `;
        monaco.languages.typescript.javascriptDefaults.addExtraLib(globals, "globals.d.ts");
        monaco.languages.typescript.typescriptDefaults.addExtraLib(globals, "globals.d.ts");
      }}
      onChange={(v) => onChange(v ?? "")}
      options={{
        minimap: { enabled: false },
        fontSize: editorPrefs.fontSize,
        tabSize: editorPrefs.tabSize,
        wordWrap: editorPrefs.wordWrap ? "on" : "off",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 14 },
      }}
    />
  );
}