import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base: './' keeps asset URLs relative so the build works both at the domain
// root and under a GitHub Pages project path (https://user.github.io/repo/).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
