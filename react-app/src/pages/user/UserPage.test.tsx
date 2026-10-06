import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { SettingsProvider } from '../../settings/SettingsContext';
import { ROUTER_FUTURE } from '../../AppRoutes';
import { mockFetch, renderWithProviders } from '../../test/render';
import { user } from '../../test/fixtures';
import UserPage from './UserPage';

const renderUser = (id = 'pg') => renderWithProviders(<UserPage />, { route: `/user/${id}`, path: '/user/:id' });

function GoTo({ to }: { to: string }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)}>go</button>;
}

describe('UserPage', () => {
  it('shows the loader first, then the profile', async () => {
    mockFetch({ '/user/pg.json': user });
    const { container } = renderUser();
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

    expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(container.querySelector('.main-details .name')).toHaveTextContent('pg');
    expect(container.querySelector('.main-details .right')).toHaveTextContent('157316 ★');
    expect(container.querySelector('.main-details .age')).toHaveTextContent('Created 20 years ago');
    const about = container.querySelector('.other-details p');
    expect(about).toHaveTextContent('Bug fixer. site');
    expect(screen.getByRole('link', { name: 'site' })).toHaveAttribute('href', 'https://paulgraham.com');
  });

  it('fetches the user from the HNPWA API', async () => {
    const fetchMock = mockFetch({ '/user/pg.json': user });
    renderUser();
    await screen.findByText('Profile: pg');
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.hnpwa.com/v0/user/pg.json');
  });

  it('hides .other-details when about is empty', async () => {
    mockFetch({ '/user/pg.json': { ...user, about: '' } });
    const { container } = renderUser();
    await screen.findByText('Profile: pg');
    expect(container.querySelector('.other-details')).toBeNull();
  });

  it('shows an error for an unknown user (HNPWA returns 200 null)', async () => {
    mockFetch({ '/user/nobody.json': null });
    renderUser('nobody');
    expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an error when HNPWA answers an unknown user with a non-JSON 200 body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response("Cannot read property 'apply' of undefined", { status: 200 }))
    );
    renderUser('nobody');
    expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
  });

  it('shows an error on network failure', async () => {
    mockFetch({ '/user/pg.json': new TypeError('Failed to fetch') });
    renderUser();
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user pg.');
  });

  it('shows an error on HTTP failure', async () => {
    mockFetch({ '/user/pg.json': { __status: 500 } });
    renderUser();
    expect(await screen.findByText('Could not load user pg.')).toBeInTheDocument();
  });

  it('refetches when :id changes', async () => {
    const fetchMock = mockFetch({
      '/user/pg.json': user,
      '/user/dang.json': { ...user, id: 'dang', karma: 42, about: '' },
    });
    render(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/user/pg']} future={ROUTER_FUTURE}>
          <GoTo to="/user/dang" />
          <Routes>
            <Route path="/user/:id" element={<UserPage />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );
    await screen.findByText('Profile: pg');
    await userEvent.click(screen.getByRole('button', { name: 'go' }));
    expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
    expect(screen.getByText('42 ★')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain('/user/dang.json');
  });

  it('aborts the in-flight request on unmount', async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        signal = init?.signal ?? undefined;
        return new Promise<Response>(() => {});
      })
    );
    const { unmount } = renderUser();
    await waitFor(() => expect(signal).toBeDefined());
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('back button navigates back', async () => {
    mockFetch({ '/user/pg.json': user });
    render(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/news/1', '/user/pg']} initialIndex={1} future={ROUTER_FUTURE}>
          <Routes>
            <Route path="/user/:id" element={<UserPage />} />
            <Route path="/news/1" element={<div data-testid="previous-page" />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );
    await screen.findByText('Profile: pg');
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByTestId('previous-page')).toBeInTheDocument();
  });

  it('back button works from the keyboard', async () => {
    mockFetch({ '/user/pg.json': user });
    render(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/news/1', '/user/pg']} initialIndex={1} future={ROUTER_FUTURE}>
          <Routes>
            <Route path="/user/:id" element={<UserPage />} />
            <Route path="/news/1" element={<div data-testid="previous-page" />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );
    await screen.findByText('Profile: pg');
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Back' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByTestId('previous-page')).toBeInTheDocument();
  });

  it('sanitizes the about HTML', async () => {
    mockFetch({
      '/user/pg.json': { ...user, about: '<img src=x onerror="alert(1)">hi <a href="javascript:alert(1)">x</a>' },
    });
    const { container } = renderUser();
    await screen.findByText('Profile: pg');
    const about = container.querySelector('.other-details p')!;
    expect(about.innerHTML).toBe('hi <a>x</a>');
  });
});
