import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // PulseHQ keeps a single .env at the repo root (shared with the Python
  // seed scripts) instead of a duplicate one inside frontend/.
  envDir: '../',
})
