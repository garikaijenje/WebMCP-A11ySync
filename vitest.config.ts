import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["packages/*/test/**/*.test.{ts,tsx}"]
  }
});
