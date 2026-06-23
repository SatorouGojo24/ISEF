import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Obligatorio para que Docker exponga el servidor al exterior
    port: 5173,
    watch: {
      usePolling: true, // Fuerza a Vite a detectar cambios de archivos en Docker
    },
  },
})