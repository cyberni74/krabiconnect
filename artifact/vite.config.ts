import { resolve } from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Standalone client-only build of the game (for the hosted artifact).
export default defineConfig({
  root: __dirname,
  resolve: { alias: { "@": resolve(__dirname, "../src") } },
  plugins: [viteReact(), tailwindcss()],
  define: { "import.meta.env.DEV": "false", "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: { entry: resolve(__dirname, "main.tsx"), formats: ["iife"], name: "Rabenschwur", fileName: () => "game.js", cssFileName: "game" },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
