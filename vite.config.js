import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias pour "@/..."
    },
  },
  server: {
    host: '127.0.0.1', // Votre IP personnalisée
    port: 3000,
    open: true,
  },
});
