import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        sidePanel: resolve(__dirname, "sidePanel.html"),
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
