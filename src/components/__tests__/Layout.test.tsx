import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Layout } from '../Layout';
import { SettingsProvider } from '@/contexts/SettingsContext';

function renderLayout(children: React.ReactNode = <p>Page content</p>) {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <Layout>{children}</Layout>
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Header, children, and Footer', () => {
    renderLayout(<p>Test page</p>);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Test page')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('wraps children in a main element', () => {
    renderLayout(<p>Main content</p>);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent('Main content');
  });

  it('applies theme class from settings', () => {
    localStorage.setItem('theme', 'night');
    const { container } = renderLayout();
    const themeWrapper = container.firstChild as HTMLElement;
    expect(themeWrapper.className).toBe('night');
  });

  it('catches errors in children via ErrorBoundary', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    function BrokenChild() {
      throw new Error('broken');
      return null;
    }

    renderLayout(<BrokenChild />);
    expect(screen.getByText('broken')).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = renderLayout();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
