import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';

import UserProfile from './index';
import { User } from '../../shared/models';
import { hackerNewsApi } from '../../shared/services/hackernews-api';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual<typeof import('react-router-dom')>('react-router-dom')),
    useNavigate: () => mockNavigate,
}));

vi.mock('../../shared/services/hackernews-api', () => ({
    hackerNewsApi: {
        fetchUser: vi.fn(),
    },
}));

function makeUser(id = 'a', about = ''): User {
    return {
        id,
        crated_time: 1672531200,
        created: '2 years ago',
        karma: 123,
        avg: 4.5,
        about,
    };
}

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;
    });

    return { promise, resolve, reject };
}

function renderUser(initialEntries = ['/user/a'], initialIndex = 0, withNavigationLink = false) {
    return render(
        <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
            <Routes>
                <Route
                    path="/user/:id"
                    element={
                        <>
                            <UserProfile />
                            {withNavigationLink && <Link to="/user/b">go</Link>}
                        </>
                    }
                />
            </Routes>
        </MemoryRouter>
    );
}

describe('UserProfile', () => {
    beforeEach(() => {
        vi.mocked(hackerNewsApi.fetchUser).mockReset();
        mockNavigate.mockReset();
    });

    it('shows loading while the user request is pending', () => {
        vi.mocked(hackerNewsApi.fetchUser).mockReturnValue(new Promise<User>(() => undefined));

        renderUser();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(document.querySelector('.profile')).not.toBeInTheDocument();
    });

    it('shows an error when the user request rejects', async () => {
        vi.mocked(hackerNewsApi.fetchUser).mockRejectedValueOnce(new Error('request failed'));

        renderUser();

        expect(await screen.findByText('Could not load user a.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(document.querySelector('.profile')).not.toBeInTheDocument();
    });

    it('renders the user profile', async () => {
        vi.mocked(hackerNewsApi.fetchUser).mockResolvedValueOnce(makeUser());

        renderUser();

        expect(await screen.findByText('a', { selector: '.name' })).toBeInTheDocument();
        expect(screen.getByText('123 ★')).toHaveClass('right');
        expect(screen.getByText('Created 2 years ago')).toHaveClass('age');
        expect(screen.getByText('Profile: a')).toHaveClass('title-block');
    });

    it('renders HTML in the about section', async () => {
        vi.mocked(hackerNewsApi.fetchUser).mockResolvedValueOnce(makeUser('a', '<b>hello</b> <pre>x</pre>'));

        renderUser();

        await screen.findByText('a', { selector: '.name' });

        const about = document.querySelector('.other-details p');
        expect(about).not.toBeNull();
        expect(about!.innerHTML).toBe('<b>hello</b> <pre>x</pre>');
        expect(about!.querySelector('b')).toBeInTheDocument();
    });

    it('does not render an about section for an empty string', async () => {
        vi.mocked(hackerNewsApi.fetchUser).mockResolvedValueOnce(makeUser('a', ''));

        renderUser();

        await screen.findByText('a', { selector: '.name' });

        expect(document.querySelector('.other-details')).not.toBeInTheDocument();
    });

    it('does not render an about section when about is undefined', async () => {
        vi.mocked(hackerNewsApi.fetchUser).mockResolvedValueOnce({
            ...makeUser(),
            about: undefined,
        } as unknown as User);

        renderUser();

        await screen.findByText('a', { selector: '.name' });

        expect(document.querySelector('.other-details')).not.toBeInTheDocument();
    });

    it('navigates back when the back button is clicked', async () => {
        vi.mocked(hackerNewsApi.fetchUser).mockResolvedValueOnce(makeUser());
        const user = userEvent.setup();

        renderUser();

        await screen.findByText('a', { selector: '.name' });
        await user.click(document.querySelector('.back-button')!);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('fetches the new user when the route ID changes', async () => {
        const userA = deferred<User>();
        const userB = deferred<User>();
        vi.mocked(hackerNewsApi.fetchUser).mockImplementation((id) => (id === 'a' ? userA.promise : userB.promise));
        const user = userEvent.setup();

        renderUser(['/user/a', '/user/b'], 0, true);

        await waitFor(() => expect(hackerNewsApi.fetchUser).toHaveBeenCalledWith('a'));
        await user.click(screen.getByRole('link', { name: 'go' }));
        await waitFor(() => expect(hackerNewsApi.fetchUser).toHaveBeenCalledWith('b'));
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await act(async () => userB.resolve(makeUser('b')));

        expect(await screen.findByText('b', { selector: '.name' })).toBeInTheDocument();
    });

    it('fetches the exact route ID once', async () => {
        vi.mocked(hackerNewsApi.fetchUser).mockResolvedValueOnce(makeUser());

        renderUser();

        await screen.findByText('a', { selector: '.name' });

        expect(hackerNewsApi.fetchUser).toHaveBeenCalledTimes(1);
        expect(hackerNewsApi.fetchUser).toHaveBeenCalledWith('a');
    });

    it('ignores a stale response after the route ID changes', async () => {
        const userA = deferred<User>();
        const userB = deferred<User>();
        vi.mocked(hackerNewsApi.fetchUser).mockImplementation((id) => (id === 'a' ? userA.promise : userB.promise));
        const user = userEvent.setup();

        renderUser(['/user/a', '/user/b'], 0, true);

        await waitFor(() => expect(hackerNewsApi.fetchUser).toHaveBeenCalledWith('a'));
        await user.click(screen.getByRole('link', { name: 'go' }));
        await waitFor(() => expect(hackerNewsApi.fetchUser).toHaveBeenCalledWith('b'));

        await act(async () => userA.resolve(makeUser('a')));
        expect(document.querySelector('.profile')).not.toBeInTheDocument();

        await act(async () => userB.resolve(makeUser('b')));

        expect(await screen.findByText('b', { selector: '.name' })).toBeInTheDocument();
        expect(document.querySelector('.name')).toHaveTextContent('b');
        expect(document.querySelector('.name')).not.toHaveTextContent('a');
    });
});
