import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";
import { fileURLToPath } from "node:url";
import { dirname, resolve as pathResolve } from "node:path";
import { readFileSync } from "node:fs";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json
const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

export default [
  {
    input: "src/index.tsx",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        browser: true,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        sourceMap: true,
        inlineSources: true,
        declaration: true,
        declarationDir: "dist/types",
      }),
      postcss({
        extensions: [".css"],
        minimize: true,
        inject: true, // Inject CSS into JS
      }),
    ],
    external: [
      ...Object.keys(packageJson.peerDependencies || {}),
      ...Object.keys(packageJson.dependencies || {}),
      "react/jsx-runtime",
    ],
  },
  {
    input: "dist/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];
