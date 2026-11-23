/// <reference types="vite/client" />

interface Window {
  ga?: (...args: unknown[]) => void;
}
