import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // Server config only for development
  ...(mode === 'development' ? {
    server: {
      host: true, // listen on all interfaces
      port: 5173,
      strictPort: false,
      allowedHosts: [
        ".ngrok-free.app", // allow all ngrok URLs
      ],
      origin: "http://localhost:5173", // optional, helps Vite accept external requests
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  } : {}),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Avoid esbuild trying to prebundle canvg which pulls core-js internals
    exclude: ["canvg"],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },

  },
}));
