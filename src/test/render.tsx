import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsProvider } from '../context/SettingsContext';

interface Options {
  route?: string;
  path?: string;
}

export function renderWithProviders(element: ReactElement, { route = '/', path = '*' }: Options = {}) {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={element} />
        </Routes>
      </MemoryRouter>
    </SettingsProvider>
  );
}
