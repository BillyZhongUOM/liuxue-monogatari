/// <reference types="vite/client" />

// Injected at build time by vite.config.ts `define`.
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;

// Minimal type for the one Node API vite.config.ts uses to read the git SHA,
// so the build-tool file typechecks without pulling in all of @types/node.
declare module 'node:child_process' {
  export function execSync(command: string): { toString(): string };
}
