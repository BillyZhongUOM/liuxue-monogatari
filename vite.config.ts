import { execSync } from 'node:child_process';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Build version: short git SHA + date, injected at build time so the menu can
// show which build is live and the player can tell a stale cache from a fresh one.
let sha = 'dev';
try {
  sha = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  /* not a git checkout */
}
const buildDate = new Date().toISOString().slice(0, 10);

// base: './' keeps asset URLs relative so the build works both at the domain
// root and under a GitHub Pages project path (https://user.github.io/repo/).
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(sha),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
