import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        sessionManager: resolve(__dirname, "sessionManager.html"),
        serviceWorker: resolve(__dirname, "serviceWorker.ts"),
        stubPage: resolve(__dirname, "stubPage.html"),
        navigationBox: resolve(__dirname, "navigationBox.html"),
        recentUpdates: resolve(__dirname, "recentUpdates.html"),
        help: resolve(__dirname, "help.html"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
