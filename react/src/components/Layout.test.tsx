import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { SettingsProvider } from '../hooks/useSettings';
import { Layout } from './Layout';

function renderLayout() {
  const router = createMemoryRouter(
    [{ path: '/', element: <Layout />, children: [{ index: true, element: <p>page body</p> }] }],
    { initialEntries: ['/'] },
  );
  return render(
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>,
  );
}

describe('Layout', () => {
  it('renders header, routed content and footer inside the default theme', () => {
    renderLayout();
    expect(screen.getByTestId('app-root')).toHaveClass('default');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('page body')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/hdjirdeh/angular2-hn',
    );
  });

  it('toggles the settings popup from the header cog and close button', async () => {
    const user = userEvent.setup();
    renderLayout();
    const cog = screen.getByRole('button', { name: 'Settings' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(cog);
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(cog).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', { name: 'Close settings' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('applies the theme chosen in settings to the root element', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Settings' }));

    await user.click(screen.getByRole('radio', { name: 'Night' }));
    expect(screen.getByTestId('app-root')).toHaveClass('night');

    await user.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));
    expect(screen.getByTestId('app-root')).toHaveClass('amoledblack');
  });
});
