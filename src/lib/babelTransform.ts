import * as BabelNS from "@babel/standalone";
import type { TargetVersion } from "../types/modes";

const Babel: typeof BabelNS = (BabelNS as any).default ?? BabelNS;

const targetVersionToBabelTarget: Record<TargetVersion, Record<string, string | boolean>> = {
  node14: { node: "14" },
  node16: { node: "16" },
  node18: { node: "18" },
  node20: { node: "20" },
  node22: { node: "22" },
  es2026: { esmodules: true },
};

export function transformFile(code: string, filename: string, target: TargetVersion): string {
  const isTs = /\.tsx?$/.test(filename);
  const isJsx = /\.(jsx|tsx)$/.test(filename);

  const presets: (string | [string, Record<string, unknown>])[] = [
    ["env", { targets: targetVersionToBabelTarget[target], modules: "commonjs" }],
  ];
  if (isTs) presets.push("typescript");
  if (isJsx) presets.push("react");

  const result = Babel.transform(code, { presets, filename });
  if (!result.code) throw new Error(`No output produced for ${filename}`);
  return result.code;
}