import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsProvider } from '../app/shared/context/SettingsProvider';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  /** Initial history entries for the surrounding MemoryRouter. */
  route?: string;
  /** Route pattern the element is mounted at, so `useParams` resolves. */
  path?: string;
}

export function renderWithProviders(ui: ReactElement, { route = '/', path, ...options }: Options = {}): RenderResult {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>
      <SettingsProvider>
        {path ? <Routes><Route path={path} element={children} /></Routes> : children}
      </SettingsProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper, ...options });
}
