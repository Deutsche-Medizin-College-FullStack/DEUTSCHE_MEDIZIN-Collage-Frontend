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
  },
  build: {
    chunkSizeWarningLimit: 1000,
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      external: [
        /core-js\/.*/, // externalize any core-js imports (e.g., core-js/modules/es.promise.js)
      ],
      output: {
        manualChunks: (id) => {
          // Create chunks based on node_modules
          if (id.includes('node_modules')) {
            // Core React libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            // UI Library chunks
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            if (id.includes('antd')) {
              return 'antd';
            }
            
            // Chart libraries
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts';
            }
            
            // Animation libraries
            if (id.includes('framer-motion') || id.includes('lottie-react') || id.includes('aos')) {
              return 'animations';
            }
            
            // PDF handling
            if (id.includes('jspdf')) {
              return 'pdf';
            }
            
            // Excel handling
            if (id.includes('xlsx')) {
              return 'excel';
            }
            
            // Icon libraries
            if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('heroicons')) {
              return 'icons';
            }
            
            // Video player
            if (id.includes('plyr') || id.includes('react-player')) {
              return 'player';
            }
            
            // Utility libraries
            if (id.includes('i18next') || id.includes('axios') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }
            
            // Router
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            
            // Other vendor libraries go into a general vendor chunk
            return 'vendor';
          }
          
          // Application code splitting based on directories
          if (id.includes('/src/pages/public/')) {
            return 'public-pages';
          }
          
          if (id.includes('/src/pages/student/')) {
            return 'student-pages';
          }
          
          if (id.includes('/src/pages/teacher/')) {
            return 'teacher-pages';
          }
          
          if (id.includes('/src/pages/registrar/')) {
            return 'registrar-pages';
          }
          
          if (id.includes('/src/pages/dean/')) {
            return 'dean-pages';
          }
          
          if (id.includes('/src/pages/vice-dean/')) {
            return 'vice-dean-pages';
          }
          
          if (id.includes('/src/pages/head/')) {
            return 'head-pages';
          }
          
          if (id.includes('/src/pages/finance/')) {
            return 'finance-pages';
          }
          
          if (id.includes('/src/pages/manager/')) {
            return 'manager-pages';
          }
          
          if (id.includes('/src/layouts/')) {
            return 'layouts';
          }
          
          if (id.includes('/src/components/')) {
            return 'components';
          }
        },
      },
    },
  },
}));
