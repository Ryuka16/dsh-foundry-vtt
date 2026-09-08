import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Use child processes rather than worker_threads. Worker threads crash on
    // teardown under newer Node (v8::ToLocalChecked in the CJS lexer), which
    // makes `npm test` exit non-zero even when every test passes.
    pool: "forks",
  },
});
