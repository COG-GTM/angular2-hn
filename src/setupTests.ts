import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom does not implement scrolling; components call it on load and on header clicks.
window.scrollTo = vi.fn();
