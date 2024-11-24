import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Para rutas relativas en producción
  build: {
    rollupOptions: {
      input: {
        main: './index.html',          // SPA principal
        blogs: './blogs.html',         // Página de blogs
        webDesign: './web-design.html', // Artículo 1
        webDevelopment: './web-development.html', // Artículo 2
        webDeployment: './web-deployment.html', // Artículo 3
      },
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js', // Archivos JS
        chunkFileNames: 'assets/js/[name]-[hash].js', // Chunks
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]', // Imágenes, CSS, etc.
      },
    },
  },
  server: {
    hmr: {
      overlay: false, // Desactiva superposición de errores en desarrollo
    },
  },
});
