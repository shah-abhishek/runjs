// src/lib/buildSandboxDoc.ts
export interface ProjectFile {
  name: string;   // "App.jsx"
  content: string;
}

const CDN = {
  react: "https://unpkg.com/react@18/umd/react.development.js",
  reactDom: "https://unpkg.com/react-dom@18/umd/react-dom.development.js",
  jquery: "https://code.jquery.com/jquery-3.7.1.min.js",
};

export function buildSandboxDoc(
  transformedFiles: Record<string, string>,
  entry: string,
  includeReact: boolean,
  includeJquery: boolean,
): string {
  const defs = Object.entries(transformedFiles)
    .map(([name, code]) =>
      `${JSON.stringify(name)}: function(module, exports, require) {\n${code}\n}`)
    .join(",\n");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /></head>
<body>
  <div id="root"></div>
  ${includeReact ? `<script src="${CDN.react}"></script><script src="${CDN.reactDom}"></script>` : ""}
  ${includeJquery ? `<script src="${CDN.jquery}"></script>` : ""}
  <script>
    (function () {
      const post = (msg) => parent.postMessage(msg, "*");
      ["log","warn","error","info"].forEach((level) => {
        const original = console[level];
        console[level] = (...args) => {
          try {
            post({ type: "console", level, args: args.map((a) => {
              if (a instanceof Error) return a.message;
              try { return JSON.parse(JSON.stringify(a)); } catch { return String(a); }
            })});
          } catch {}
          original(...args);
        };
      });
      window.onerror = (message, _s, _l, _c, error) => {
        post({ type: "error", message: String(message), stack: error && error.stack });
        return true;
      };
      window.addEventListener("unhandledrejection", (e) =>
        post({ type: "error", message: "Unhandled promise rejection: " + String(e.reason) }));
      post({ type: "ready" });
    })();
  </script>
  <script>
    (function () {
      var __defs = {
${defs}
      };
      var __cache = {};

      // Resolve "./Header" against the files we actually have
      function resolve(spec) {
        var bare = spec.replace(/^\\.\\//, "");
        var candidates = [bare, bare + ".jsx", bare + ".js", bare + ".tsx", bare + ".ts"];
        for (var i = 0; i < candidates.length; i++) {
          if (__defs[candidates[i]]) return candidates[i];
        }
        return null;
      }

      function require(spec) {
        // Libraries are globals from the CDN scripts, not files
        if (spec === "react") return window.React;
        if (spec === "react-dom" || spec === "react-dom/client") return window.ReactDOM;
        if (spec === "jquery") return window.jQuery;

        var name = resolve(spec);
        if (!name) throw new Error("Cannot find module '" + spec + "'");
        if (__cache[name]) return __cache[name].exports;

        var module = { exports: {} };
        __cache[name] = module;
        __defs[name](module, module.exports, require);
        return module.exports;
      }

      try {
        require(${JSON.stringify(entry)});
        parent.postMessage({ type: "execution-complete" }, "*");
      } catch (err) {
        parent.postMessage({ type: "error", message: err.message, stack: err.stack }, "*");
        parent.postMessage({ type: "execution-complete" }, "*");
      }
    })();
  </script>
</body></html>`;
}