import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
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

function GoTo({ to }: { to: string }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)}>go</button>;
}

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

  it('aborts a pending request and ignores its late response when the id changes', async () => {
    let resolvePg: (u: HnUser) => void = () => {};
    mockFetchUser.mockImplementation((id) =>
      id === 'pg' ? new Promise<HnUser>((resolve) => (resolvePg = resolve)) : Promise.resolve({ ...pg, id })
    );
    const { container } = render(
      <MemoryRouter initialEntries={['/user/pg']}>
        <Routes>
          <Route path="/user/:id" element={<><GoTo to="/user/dang" /><User /></>} />
        </Routes>
      </MemoryRouter>
    );
    expect(container.querySelector('.loader')).toBeInTheDocument();
    const pgSignal = mockFetchUser.mock.calls[0][1] as AbortSignal;
    await userEvent.click(screen.getByRole('button', { name: 'go' }));
    expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
    expect(pgSignal.aborted).toBe(true);
    await act(async () => resolvePg(pg));
    expect(screen.getByText('Profile: dang')).toBeInTheDocument();
    expect(screen.queryByText('Profile: pg')).not.toBeInTheDocument();
  });

  it('strips unsafe markup from about', async () => {
    mockFetchUser.mockResolvedValue({ ...pg, about: '<img src="x" onerror="alert(1)">ok<script>alert(2)</script>' });
    const { container } = renderAt('/user/pg');
    await screen.findByText('157316 ★');
    const about = container.querySelector('.other-details p')!;
    expect(about.innerHTML).not.toMatch(/onerror|<script/);
    expect(about).toHaveTextContent('ok');
  });
});
