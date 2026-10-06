import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import type { User } from '../shared/models';
import { fetchUser } from '../shared/services/hackernewsApi';
import { renderWithProviders } from '../test/renderWithProviders';
import UserProfile from './UserProfile';

vi.mock('../shared/services/hackernewsApi');

const mockFetchUser = vi.mocked(fetchUser);

const pg: User = {
    id: 'pg',
    created: '19 years ago',
    karma: 157316,
    avg: 4.2,
    about: 'Bug fixer. <a href="https://paulgraham.com">paulgraham.com</a>',
};

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function renderProfile(route = '/user/pg') {
    return renderWithProviders(
        <>
            <Routes>
                <Route path="/user/:id" element={<UserProfile />} />
                <Route path="/news/1" element={<Link to="/user/pg">open pg</Link>} />
            </Routes>
            <Link to="/user/dang">dang</Link>
        </>,
        { route }
    );
}

describe('UserProfile', () => {
    it('shows the loader while loading and keeps the root data attributes', () => {
        mockFetchUser.mockReturnValue(new Promise(() => {}));
        renderProfile();
        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        const root = screen.getByTestId('user-profile');
        expect(root).toHaveAttribute('data-user-id', 'pg');
        expect(mockFetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
        expect(root.querySelector('.profile')).toBeNull();
    });

    it('renders the loaded profile with about', async () => {
        mockFetchUser.mockResolvedValue(pg);
        renderProfile();
        const root = screen.getByTestId('user-profile');
        await waitFor(() => expect(root.querySelector('.profile')).not.toBeNull());
        expect(screen.queryByRole('status')).toBeNull();
        expect(root.querySelector('.item-header.mobile .title-block')).toHaveTextContent('Profile: pg');
        expect(root.querySelector('.main-details .name')).toHaveTextContent('pg');
        expect(root.querySelector('.main-details .right')).toHaveTextContent('157316 ★');
        expect(root.querySelector('.main-details .age')).toHaveTextContent('Created 19 years ago');
        const about = root.querySelector('.other-details p')!;
        expect(about).toHaveTextContent('Bug fixer. paulgraham.com');
        expect(about.querySelector('a')).toHaveAttribute('href', 'https://paulgraham.com');
        expect(root).toHaveAttribute('data-user-id', 'pg');
    });

    it('omits other-details when the user has no about', async () => {
        mockFetchUser.mockResolvedValue({ ...pg, about: undefined });
        renderProfile();
        await screen.findByText('Created 19 years ago');
        expect(screen.getByTestId('user-profile').querySelector('.other-details')).toBeNull();
    });

    it('sanitizes the about html', async () => {
        mockFetchUser.mockResolvedValue({
            ...pg,
            about: '<img src="x" onerror="alert(1)"><script>alert(2)</script>hi',
        });
        renderProfile();
        await screen.findByText('hi');
        const about = screen.getByTestId('user-profile').querySelector('.other-details p')!;
        expect(about.innerHTML).not.toMatch(/script|onerror/);
    });

    it('shows the error message when loading fails', async () => {
        mockFetchUser.mockRejectedValue(new Error('HN API request failed with status 404'));
        renderProfile();
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Could not load user pg.');
        expect(screen.queryByRole('status')).toBeNull();
        expect(screen.getByTestId('user-profile')).toHaveAttribute('data-user-id', 'pg');
    });

    it('ignores AbortError rejections', async () => {
        mockFetchUser.mockRejectedValue(new DOMException('aborted', 'AbortError'));
        renderProfile();
        await act(async () => {});
        expect(screen.queryByRole('alert')).toBeNull();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('navigates back on click and via keyboard', async () => {
        mockFetchUser.mockResolvedValue(pg);
        renderProfile('/news/1');
        const user = userEvent.setup();

        await user.click(screen.getByRole('link', { name: 'open pg' }));
        const back = await screen.findByRole('button', { name: 'Go back' });
        expect(back).toHaveClass('back-button');
        expect(back).toHaveAttribute('tabindex', '0');
        await user.click(back);
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');

        await user.click(screen.getByRole('link', { name: 'open pg' }));
        (await screen.findByRole('button', { name: 'Go back' })).focus();
        await user.keyboard('{Enter}');
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');

        await user.click(screen.getByRole('link', { name: 'open pg' }));
        (await screen.findByRole('button', { name: 'Go back' })).focus();
        await user.keyboard(' ');
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');

        await user.click(screen.getByRole('link', { name: 'open pg' }));
        fireEvent.keyDown(await screen.findByRole('button', { name: 'Go back' }), { key: 'a' });
        expect(screen.getByTestId('location')).toHaveTextContent('/user/pg');
    });

    it('aborts and refetches when the id changes, ignoring the stale response', async () => {
        const first = deferred<User>();
        const second = deferred<User>();
        mockFetchUser.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
        renderProfile();
        const firstSignal = mockFetchUser.mock.calls[0][1]!;
        expect(firstSignal.aborted).toBe(false);

        await userEvent.setup().click(screen.getByRole('link', { name: 'dang' }));
        expect(firstSignal.aborted).toBe(true);
        expect(mockFetchUser).toHaveBeenLastCalledWith('dang', expect.any(AbortSignal));
        expect(screen.getByTestId('user-profile')).toHaveAttribute('data-user-id', 'dang');

        await act(async () => first.resolve(pg));
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByText('Created 19 years ago')).toBeNull();

        await act(async () => second.resolve({ id: 'dang', created: '16 years ago', karma: 30000 }));
        expect(screen.getByText('Profile: dang')).toBeInTheDocument();
        expect(screen.getByText('30000 ★')).toBeInTheDocument();
    });

    it('does not show an error for a request rejected after the id changed', async () => {
        const first = deferred<User>();
        mockFetchUser.mockReturnValueOnce(first.promise).mockResolvedValueOnce({ ...pg, id: 'dang' });
        renderProfile();
        await userEvent.setup().click(screen.getByRole('link', { name: 'dang' }));
        await act(async () => first.reject(new Error('network down')));
        expect(screen.queryByRole('alert')).toBeNull();
        expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
    });

    it('aborts the request on unmount', () => {
        mockFetchUser.mockReturnValue(new Promise(() => {}));
        const { unmount } = renderProfile();
        const signal = mockFetchUser.mock.calls[0][1]!;
        unmount();
        expect(signal.aborted).toBe(true);
    });
});
