import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [{
    name: "test-pwa-register",
    // App tests provide this build-time virtual module through vi.mock.
    resolveId: (id) => id === "virtual:pwa-register/react" ? id : undefined,
  }],
  test: {
    include: ["src/**/*.test.{ts,tsx}", "worker/**/*.test.ts"],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      reporter: ["text", "json-summary"],
    },
  },
});
