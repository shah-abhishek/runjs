# RunJS

An in-browser playground for JavaScript, TypeScript, React and jQuery. Write across multiple files, import between them, and see console output and a live DOM preview side by side — with no backend and no code leaving the browser.

**[Live demo](https://runjs.developerbudy.com/)** · [Screenshots](#screenshots)

---

## Why this exists

Most online compilers ship your code to a server, run it in a container, and send back stdout. That works for C++ or Python, but it's the wrong shape for JavaScript: you lose the DOM, you pay a network round trip per run, and you can't render a React component.

RunJS runs everything client-side instead. Code is transformed in the browser with Babel, executed inside a sandboxed `iframe`, and its output is streamed back over `postMessage`. Nothing is uploaded, nothing is stored server-side, and React components render for real.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  React + TypeScript shell                                 │
│                                                            │
│  ┌──────────────┐        ┌──────────────────────────────┐ │
│  │ Monaco       │        │  Sandboxed <iframe>           │ │
│  │ one model    │        │  sandbox="allow-scripts …"    │ │
│  │ per file     │        │  (no allow-same-origin)       │ │
│  └──────┬───────┘        │                                │ │
│         │                │  • CommonJS module registry    │ │
│    files │ Record<…>     │  • custom require() + cache    │ │
│         ▼                │  • console.* patched           │ │
│  ┌──────────────┐        │  • window.onerror captured     │ │
│  │ Babel        │ srcDoc │                                │ │
│  │ standalone   ├───────►│           postMessage          │ │
│  │ per-file     │        │                ↓               │ │
│  │ presets      │        └────────────────┼───────────────┘ │
│  └──────────────┘                         │                 │
│                                            ▼                 │
│                            Console panel  ·  Live preview    │
└──────────────────────────────────────────────────────────┘
```

### Isolation

The preview `iframe` is given `allow-scripts` but deliberately **never** `allow-same-origin`. The two together would defeat the sandbox entirely, letting executed code reach the parent document, cookies and storage. Because the iframe stays origin-opaque, user code cannot touch the host app no matter what it does.

`allow-top-navigation` is excluded for the same reason — it would let a snippet navigate the whole tab away.

The remaining flags (`allow-modals`, `allow-popups`, `allow-forms`, `allow-downloads`) are opt-in per user, exposed in Settings, and persisted. That keeps `alert()` and `window.open()` working for people who need them without enabling them by default.

### Module resolution

Each file is transformed to CommonJS and registered as a factory function. A small `require()` shim inside the sandbox resolves specifiers against the registered files, tries the usual extensions, caches module instances, and maps bare library imports (`react`, `react-dom`, `jquery`) to the UMD globals loaded from CDN.

This is what makes `import Header from "./Header"` work between editor tabs without a bundler.

### Target versions

The target selector maps friendly labels (Node 14 → Node 22, ES2026) to Babel `preset-env` targets. Picking an older target down-levels modern syntax so you can check what actually compiles for a given runtime.

Note that Babel transforms *syntax*, not *built-ins* — newer methods like `Set.prototype.union` depend on the browser you're running in, not on the selected target.

## Features

- **Multi-file projects** — add, switch and delete files; imports resolve between them
- **Five modes** — JavaScript, TypeScript, React (JSX), React (TSX), jQuery, each with a working starter project
- **Live preview + console** — captured `console.log/warn/error/info`, uncaught errors, and unhandled promise rejections
- **Configurable sandbox** — toggle modal, popup, form and download permissions
- **Editor preferences** — font size, tab size, word wrap
- **Execution watchdog** — resets the preview if code hasn't finished in time, so a runaway loop can't take the app down with it
- **Prettier formatting** — one click, correct parser chosen per file extension
- **Share by URL** — the whole project is encoded into a link
- **Light and dark themes** — follows system preference until you choose, then remembers your choice
- **Keyboard shortcut** — `⌘↵` / `Ctrl+↵` to run

## Stack

| | |
|---|---|
| Build | Vite |
| UI | React 18, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme` config) |
| Editor | Monaco (`@monaco-editor/react`) |
| Transforms | `@babel/standalone` |
| Layout | `react-resizable-panels` |
| Formatting | `prettier/standalone` |
| Type | IBM Plex Sans / IBM Plex Mono |

## Running locally

```bash
git clone https://github.com/shah-abhishek/runjs.git
cd runjs
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build     # type-check and produce a production build
npm run preview   # serve the production build locally
```

## Project structure

```
src/
  components/
    Editor.tsx          Monaco wrapper, one model per file
    FileTabs.tsx        file switcher, add and delete
    Toolbar.tsx         mode, target, run, format, theme
    RightPanel.tsx      tabbed preview and console
    PreviewFrame.tsx    the sandboxed iframe
    SettingsModal.tsx   sandbox, editor and execution settings
    Sidebar.tsx         left rail
    StatusBar.tsx       language, target, run time, error count
  lib/
    babelTransform.ts   per-file preset selection and target mapping
    buildSandboxDoc.ts  sandbox HTML, module registry, require shim
    sandboxPermissions.ts
    editorPreferences.ts
    executionSettings.ts
    themeTokens.ts      theme persistence and custom Monaco theme
    formatCode.ts
    shareUrl.ts
    starterProjects.ts
    messageTypes.ts     typed iframe ↔ parent contract
  types/
    modes.ts
```

## Known limitations

These are deliberate trade-offs, not oversights:

- **No type checking.** Babel strips TypeScript types without verifying them, so `const x: number = "oops"` compiles and runs. Monaco flags it in the editor, but it won't stop a run.
- **The timeout recovers the app, it doesn't stop your code.** JavaScript can't interrupt a synchronous busy loop from outside. A genuine `while (true) {}` keeps burning CPU in the iframe's process; the watchdog replaces the iframe so the rest of the app stays usable. Actually terminating it would require moving execution into a Web Worker.
- **No npm packages.** Only React, ReactDOM and jQuery are available, loaded as UMD globals from CDN.
- **Built-ins aren't polyfilled.** Selecting an older target down-levels syntax only; newer runtime methods still depend on your browser.

## Screenshots

![alt text](<Screenshot 2026-09-15 135806.png>)

## License

MIT
