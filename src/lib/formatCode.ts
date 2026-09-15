import * as prettier from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import typescriptPlugin from "prettier/plugins/typescript";

export async function formatCode(code: string, filename: string): Promise<string> {
  return prettier.format(code, {
    parser: /\.tsx?$/.test(filename) ? "typescript" : "babel",
    plugins: [babelPlugin, estreePlugin, typescriptPlugin],
    semi: true,
    singleQuote: false,
  });
}