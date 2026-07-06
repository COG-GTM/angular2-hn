export {};

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}
