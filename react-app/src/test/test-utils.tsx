import { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsProvider } from '../context/SettingsContext';

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path }: { route?: string; path?: string } = {}
) {
  const wrapped: ReactNode = path ? (
    <Routes>
      <Route path={path} element={ui} />
    </Routes>
  ) : (
    ui
  );

  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[route]}>{wrapped}</MemoryRouter>
    </SettingsProvider>
  );
}
