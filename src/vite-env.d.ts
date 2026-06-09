/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
  // Google Analytics global (analytics.js) loaded in index.html
  const ga: ((...args: unknown[]) => void) | undefined;
}

export {};
