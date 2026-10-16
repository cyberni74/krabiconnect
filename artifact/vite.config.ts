import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  base: "./",
  publicDir: path.resolve(root, "../public"),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(root, "../src") } },
  build: { outDir: path.resolve(root, "dist"), emptyOutDir: true, assetsInlineLimit: 0 },
});
