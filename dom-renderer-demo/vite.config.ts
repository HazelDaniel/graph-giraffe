import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // Consume the local core source directly for fast iteration.
      "@graph-giraffe/core": fileURLToPath(
        new URL("../src/index.ts", import.meta.url)
      ),
      "@graph-giraffe/core/assets": fileURLToPath(
        new URL("../assets", import.meta.url)
      ),
    },
  },
  server: {
    port: 5180,
  },
});
