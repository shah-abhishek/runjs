import type { LanguageMode } from "../types/modes";

export interface Project {
  files: Record<string, string>;
  entry: string;
}

export const STARTER_PROJECTS: Record<LanguageMode, Project> = {
  javascript: {
    entry: "main.js",
    files: { "main.js": `console.log("hello world");` },
  },

  typescript: {
    entry: "main.ts",
    files: {
      "main.ts": `const greet = (name: string): string => \`Hello, \${name}\`;\n\nconsole.log(greet("world"));`,
    },
  },

  react: {
    entry: "App.jsx",
    files: {
      "App.jsx": `import Header from "./Header";

function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <Header title="Hello from React" />
      <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

      "Header.jsx": `export default function Header({ title }) {
  return <h1 style={{ marginTop: 0 }}>{title}</h1>;
}`,
    },
  },

  "react-ts": {
    entry: "App.tsx",
    files: {
      "App.tsx": `import Header from "./Header";

function App() {
  const [count, setCount] = React.useState<number>(0);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <Header title="Hello from React" />
      <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);`,

      "Header.tsx": `interface Props {
  title: string;
}

export default function Header({ title }: Props) {
  return <h1 style={{ marginTop: 0 }}>{title}</h1>;
}`,
    },
  },

  jquery: {
    entry: "main.js",
    files: {
      "main.js": `$("#root").html("<h1>Hello from jQuery</h1>");
$("#root").css({ fontFamily: "system-ui", padding: "24px" });`,
    },
  },
};