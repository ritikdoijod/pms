import { defineConfig } from "vitest/config";
import alias from "@rollup/plugin-alias";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  plugins: [
    alias({
      entries: [
        { find: "@", replacement: path.resolve(__dirname) },
      ],
    }),
  ],
});
