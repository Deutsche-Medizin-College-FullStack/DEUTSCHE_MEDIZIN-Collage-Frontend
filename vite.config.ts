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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Simplified chunking to avoid circular dependencies
          if (id.includes('node_modules')) {
            // Keep React and React DOM together to avoid initialization issues
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            
            // Keep router with React
            if (id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // Large UI libraries get their own chunks
            if (id.includes('antd')) {
              return 'antd';
            }
            
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            // Large utility libraries
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts';
            }
            
            if (id.includes('jspdf')) {
              return 'pdf';
            }
            
            if (id.includes('xlsx')) {
              return 'excel';
            }
            
            // Everything else goes into vendor to avoid circular deps
            return 'vendor';
          }
        },
      },
    },
  },
}));
