import { defineConfig } from "tsup";

export default defineConfig([
  // Node / Bundler bundle (ESM + CJS + DTS)
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    outDir: "dist",
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".mjs" : ".cjs"
      };
    }
  },
  // Standalone browser IIFE bundle for direct script tags / CDN
  {
    entry: {
      a11ysync: "src/index.ts"
    },
    format: ["iife"],
    globalName: "A11ySync",
    clean: false,
    sourcemap: true,
    minify: true,
    outDir: "dist",
    platform: "browser",
    outExtension() {
      return {
        js: ".global.js"
      };
    }
  }
]);
