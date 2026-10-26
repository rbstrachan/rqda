import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@/lib": resolve("src/main/lib"),
        "@/shared": resolve("src/shared"),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve("src/preload/index.ts"),
          project: resolve("src/preload/project.ts"),
        },
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve("src/renderer/src"),
        "@renderer": resolve("src/renderer/src"),
        "@shared": resolve("src/shared"),
        "@/components": resolve("src/renderer/src/components"),
        "@/lib": resolve("src/renderer/src/lib"),
        "@/utils": resolve("src/renderer/src/utils"),
        "@/hooks": resolve("src/renderer/src/hooks"),
      },
    },
    plugins: [react(), tailwindcss()],
  },
});
