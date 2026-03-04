// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://tomastech.dev',
  integrations: [tailwind(), react()],
  devToolbar: {
    enabled: false,
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
            'vendor-gsap': ['gsap'],
            'vendor-react': ['react', 'react-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-pdf': ['jspdf', 'jspdf-autotable'],
            'vendor-excel': ['exceljs'],
          },
        },
      },
    },
  },
});
