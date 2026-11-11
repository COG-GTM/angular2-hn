import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { fetchUser } from '../api/hackerNewsApi';
import type { User } from '../models';
import { UserPage } from './UserPage';

vi.mock('../api/hackerNewsApi', () => ({ fetchUser: vi.fn() }));
const user: User = { id: 'pg', created: '20 years ago', crated_time: 0, karma: 123, avg: 0, about: '<b>Hello</b><pre>code</pre>' };
beforeEach(() => { vi.mocked(fetchUser).mockReset(); });
function renderPage() {
  return render(<MemoryRouter initialEntries={['/news', '/user/pg']} initialIndex={1}>
    <Routes><Route path="/user/:id" element={<UserPage />} /><Route path="/news" element={<h1>News</h1>} /></Routes>
  </MemoryRouter>);
}
it('shows the shared loader while fetching', () => {
  vi.mocked(fetchUser).mockReturnValue(new Promise(() => {}));
  renderPage();
  expect(screen.getByText('Loading...')).toBeTruthy();
  expect(fetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
});
it('renders profile fields and about HTML, and goes back', async () => {
  vi.mocked(fetchUser).mockResolvedValue(user);
  const { container } = renderPage();
  expect(await screen.findByText('Created 20 years ago')).toBeTruthy();
  expect(container.querySelector('.name')?.textContent).toBe('pg');
  expect(screen.getByText('123 ★')).toBeTruthy();
  expect(container.querySelector('.other-details b')?.textContent).toBe('Hello');
  expect(container.querySelector('pre')?.textContent).toBe('code');
  expect(screen.queryByText('Loading...')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
  expect(screen.getByRole('heading', { name: 'News' })).toBeTruthy();
});
it('shows the shared error message on rejection', async () => {
  vi.mocked(fetchUser).mockRejectedValue(new Error('offline'));
  renderPage();
  expect(await screen.findByText('Could not load user pg.')).toBeTruthy();
  expect(screen.queryByText('Loading...')).toBeNull();
});
it('omits the about section when empty', async () => {
  vi.mocked(fetchUser).mockResolvedValue({ ...user, about: '' });
  const { container } = renderPage();
  await screen.findByText('Created 20 years ago');
  expect(container.querySelector('.other-details')).toBeNull();
});
it('aborts the pending request when leaving the page', async () => {
  vi.mocked(fetchUser).mockReturnValue(new Promise(() => {}));
  const { unmount } = renderPage();
  const signal = vi.mocked(fetchUser).mock.calls[0][1];
  unmount();
  await waitFor(() => expect(signal?.aborted).toBe(true));
});
