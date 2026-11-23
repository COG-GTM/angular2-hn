import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { User as HnUser } from '../../api/types';
import { fetchUser } from '../../api/hn';
import User from './User';

vi.mock('../../api/hn', () => ({ fetchUser: vi.fn() }));
const mockFetchUser = vi.mocked(fetchUser);

const pg: HnUser = {
  id: 'pg',
  created_time: 1160418092,
  created: '19 years ago',
  karma: 157316,
  about: 'Bug fixer. <a href="https://example.com">site</a><pre>code</pre>',
};

function renderAt(path: string, initialEntries: string[] = [path]) {
  return render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialEntries.length - 1}>
      <Routes>
        <Route path="/user/:id" element={<User />} />
        <Route path="/news/1" element={<p>news page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => mockFetchUser.mockReset());

describe('User', () => {
  it('shows the loader while the profile loads', () => {
    mockFetchUser.mockReturnValue(new Promise(() => {}));
    const { container } = renderAt('/user/pg');
    expect(container.querySelector('.hn-user .loader')).toBeInTheDocument();
    expect(mockFetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
  });

  it('renders id, karma, created and about as HTML', async () => {
    mockFetchUser.mockResolvedValue(pg);
    const { container } = renderAt('/user/pg');
    expect(await screen.findByText('157316 ★')).toHaveClass('right');
    expect(container.querySelector('.main-details .name')).toHaveTextContent('pg');
    expect(container.querySelector('.main-details .age')).toHaveTextContent('Created 19 years ago');
    expect(container.querySelector('.mobile.item-header .title-block')).toHaveTextContent('Profile: pg');
    expect(screen.getByRole('link', { name: 'site' })).toHaveAttribute('href', 'https://example.com');
    expect(container.querySelector('.other-details pre')).toHaveTextContent('code');
    expect(container.querySelector('.loader')).not.toBeInTheDocument();
  });

  it('omits the about block when about is empty', async () => {
    mockFetchUser.mockResolvedValue({ ...pg, about: '' });
    const { container } = renderAt('/user/pg');
    await screen.findByText('157316 ★');
    expect(container.querySelector('.other-details')).not.toBeInTheDocument();
  });

  it('shows the error message when the user cannot be loaded', async () => {
    mockFetchUser.mockRejectedValue(new Error('boom'));
    renderAt('/user/nobody-here');
    expect(await screen.findByText('Could not load user nobody-here.')).toHaveClass('strong');
  });

  it('treats an empty response as an error', async () => {
    mockFetchUser.mockResolvedValue(null as unknown as HnUser);
    renderAt('/user/ghost');
    expect(await screen.findByText('Could not load user ghost.')).toBeInTheDocument();
  });

  it('back button returns to the previous page', async () => {
    mockFetchUser.mockResolvedValue(pg);
    renderAt('/user/pg', ['/news/1', '/user/pg']);
    await userEvent.click(await screen.findByRole('button', { name: 'Back' }));
    expect(screen.getByText('news page')).toBeInTheDocument();
  });

  it('back button works from the keyboard', async () => {
    mockFetchUser.mockResolvedValue(pg);
    renderAt('/user/pg', ['/news/1', '/user/pg']);
    (await screen.findByRole('button', { name: 'Back' })).focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('news page')).toBeInTheDocument();
  });

  it('reloads when the route id changes', async () => {
    mockFetchUser.mockImplementation((id) => Promise.resolve({ ...pg, id }));
    renderAt('/user/dang', ['/user/pg', '/user/dang']);
    expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    expect(mockFetchUser).toHaveBeenLastCalledWith('pg', expect.any(AbortSignal));
  });
});
