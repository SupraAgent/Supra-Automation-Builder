import { defineConfig } from "tsup";
import { copyFileSync } from "fs";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@xyflow/react"],
  banner: {
    js: '"use client";',
  },
  onSuccess: async () => {
    copyFileSync("src/styles.css", "dist/styles.css");
    console.log("Copied styles.css to dist/");
  },
});
