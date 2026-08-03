import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import { installMemoryLocalStorage } from './localStorage';
import { setPrefersDarkColorScheme } from './matchMedia';

installMemoryLocalStorage();

beforeEach(() => {
  localStorage.clear();
  setPrefersDarkColorScheme(false);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
