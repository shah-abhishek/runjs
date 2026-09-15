export type ConsoleLevel = "log" | "warn" | "error" | "info";

export type SandboxMessage =
  | { type: "console"; level: ConsoleLevel; args: unknown[] }
  | { type: "error"; message: string; stack?: string }
  | { type: "ready" }
  | { type: "execution-complete" };