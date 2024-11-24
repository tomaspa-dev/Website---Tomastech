import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Esto asegura que las rutas sean relativas
    server: {
        hmr: {
        overlay: false,  // Desactiva la superposición de errores
        },
    },
});
