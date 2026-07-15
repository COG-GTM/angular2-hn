import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/App';
import { SettingsProvider } from '../../src/context/SettingsContext';

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </SettingsProvider>
  );
}

export function renderApp({ route = '/news/1' }: { route?: string } = {}) {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </SettingsProvider>
  );
}
