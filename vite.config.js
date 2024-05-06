import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        script: resolve(__dirname, "index.html"),
        serviceWorker: resolve(__dirname, "serviceWorker.ts"),
        stubPage: resolve(__dirname, "stubPage.ts"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
