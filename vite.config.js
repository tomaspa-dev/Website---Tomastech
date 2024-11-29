import { resolve } from 'path';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      ext: '.br',
      algorithm: 'brotliCompress',
      deleteOriginFile: false,
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, './index.html'),   // SPA principal
        blogs: resolve(__dirname, './blogs.html'),  // Ruta al archivo blogs.html
        webDesign: resolve(__dirname, './web-design.html'), // Ruta al archivo web-design.html
        webDevelopment: resolve(__dirname, './web-development.html'), // Ruta al archivo web-development.html
        webDeployment: resolve(__dirname, './web-deployment.html'), // Ruta al archivo web-deployment.html
      },
    },
  },
  server: {
    hmr: {
      overlay: false, // Desactiva superposición de errores en desarrollo
    },
  },
});
