import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /<repo>/, so the base path is set at build
// time via BASE_PATH (see .github/workflows/deploy.yml). Dev keeps "/".
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? '/',
});
