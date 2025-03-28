import { defineConfig } from "vitest/config"
import path from "path";

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 15_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    }
  },
})
