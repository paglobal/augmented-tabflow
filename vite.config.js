import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        script: resolve(__dirname, "index.html"),
        "service-worker": resolve(__dirname, "service-worker.ts"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
