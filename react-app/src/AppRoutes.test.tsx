import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SettingsProvider } from './settings/SettingsContext';
import { AppRoutes, ROUTER_FUTURE } from './AppRoutes';
import { mockFetch } from './test/render';

function renderAt(path: string) {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[path]} future={ROUTER_FUTURE}>
        <AppRoutes />
      </MemoryRouter>
    </SettingsProvider>
  );
}

describe('AppRoutes', () => {
  it('applies the theme class to the root wrapper', () => {
    mockFetch({ '': [] });
    localStorage.setItem('theme', 'night');
    renderAt('/news/1');
    expect(screen.getByTestId('theme-root')).toHaveClass('night');
  });

  it.each(['/', '/news', '/does/not/exist'])('redirects %s to the news feed', async (path) => {
    mockFetch({ '': [] });
    renderAt(path);
    expect(await screen.findByTestId('theme-root')).toBeInTheDocument();
    expect(document.querySelector('.main-content')).toBeInTheDocument();
  });
});
