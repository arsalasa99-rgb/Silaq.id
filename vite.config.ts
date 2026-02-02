import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  resolve: {
    mainFields: ['module']
  },
  define: {
    // Polyfill process.env.API_KEY agar tidak crash di browser
    // Mengambil dari VITE_API_KEY (Vercel) atau string kosong
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || '')
  }
});