import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        script: resolve(__dirname, "index.html"),
        serviceWorker: resolve(__dirname, "serviceWorker.ts"),
        stubPage: resolve(__dirname, "stubPage.html"),
        navigationBox: resolve(__dirname, "navigationBox.html"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
