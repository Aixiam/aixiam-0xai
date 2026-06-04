import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// This is the specific repository name for the GitHub Pages base path
const GITHUB_REPO_NAME = "versoriumx-0xai-ecosystem";

// Detect if we are building for GitHub Pages deployment
const isGithubPagesBuild = process.env.NODE_ENV === 'production' && process.env.VITE_DEPLOY_TO_GH_PAGES === 'true';

export default defineConfig({
  plugins: [react()],
  // Set the base path dynamically for GitHub Pages deployments
  // Otherwise, for local development, use '/'
  base: isGithubPagesBuild ? `/${GITHUB_REPO_NAME}/` : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});
