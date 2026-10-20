import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import User from './User';
import { sanitizeHtml } from './sanitize-html';
import type { User as UserModel } from '../shared/models';

const fetchUserMock = vi.fn<(id: string) => Promise<UserModel | null>>();

vi.mock('../shared/api/hackernews-api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../shared/api/hackernews-api')>();
    return { ...actual, fetchUser: (id: string) => fetchUserMock(id) };
});

const pg: UserModel = {
    id: 'pg',
    created_time: 1160418092,
    created: '20 years ago',
    karma: 157316,
    avg: null,
    about: 'Bug <b>fixer</b>.<p>Second paragraph',
};

function renderUser(path: string) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/news/1', path]} initialIndex={1}>
                <Routes>
                    <Route path="/news/:page" element={<p>feed page</p>} />
                    <Route path="/user/:id" element={<User />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
}

describe('sanitizeHtml', () => {
    it('keeps the markup HN emits and unwraps unknown elements', () => {
        expect(sanitizeHtml('Bug <b>fixer</b>.<p>Second <code>x</code><pre>y</pre>')).toBe(
            'Bug <b>fixer</b>.<p>Second <code>x</code></p><pre>y</pre>'
        );
        expect(sanitizeHtml('<div class="c"><span style="x">text</span></div>')).toBe('text');
        expect(sanitizeHtml('<a href="mailto:a@b.c">m</a><a href="/user/pg">u</a>')).toBe(
            '<a href="mailto:a@b.c">m</a><a href="/user/pg">u</a>'
        );
    });
});

describe('User', () => {
    beforeEach(() => {
        fetchUserMock.mockReset();
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows the loader while the user is loading', () => {
        fetchUserMock.mockReturnValue(new Promise(() => {}));
        const { container } = renderUser('/user/pg');

        expect(container.querySelector('.app-user .app-loader-component')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(container.querySelector('.profile')).not.toBeInTheDocument();
    });

    it('renders id, karma, created date and about HTML with the Angular class names', async () => {
        fetchUserMock.mockResolvedValue(pg);
        const { container } = renderUser('/user/pg');

        expect(await screen.findByText('pg', { selector: '.name' })).toBeInTheDocument();
        expect(fetchUserMock).toHaveBeenCalledWith('pg');
        expect(container.querySelector('.app-user > .profile')).toBeInTheDocument();
        expect(screen.getByText('157316 ★', { selector: '.main-details .right' })).toBeInTheDocument();
        expect(screen.getByText('Created 20 years ago', { selector: '.main-details .age' })).toBeInTheDocument();
        expect(screen.getByText('Profile: pg', { selector: '.mobile.item-header .title-block' })).toBeInTheDocument();

        const about = container.querySelector('.other-details > p');
        expect(about).toBeInTheDocument();
        expect(about?.innerHTML).toBe('Bug <b>fixer</b>.<p>Second paragraph</p>');
        expect(about?.querySelector('b')).toHaveTextContent('fixer');

        expect(container.querySelector('.app-loader-component')).not.toBeInTheDocument();
        expect(container.querySelector('.app-error-message')).not.toBeInTheDocument();
    });

    it('omits the about block when the user has no about text', async () => {
        fetchUserMock.mockResolvedValue({ ...pg, id: 'dang', karma: 42, about: undefined });
        const { container } = renderUser('/user/dang');

        expect(await screen.findByText('dang', { selector: '.name' })).toBeInTheDocument();
        expect(screen.getByText('42 ★')).toBeInTheDocument();
        expect(container.querySelector('.other-details')).not.toBeInTheDocument();
    });

    it('scrolls to the top once the user has loaded', async () => {
        fetchUserMock.mockResolvedValue(pg);
        renderUser('/user/pg');

        await screen.findByText('pg', { selector: '.name' });
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('shows the Angular error message when the request fails', async () => {
        fetchUserMock.mockRejectedValue(new Error('boom'));
        const { container } = renderUser('/user/nobody');

        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
        expect(container.querySelector('.app-user .app-error-message')).toBeInTheDocument();
        expect(container.querySelector('.app-loader-component')).not.toBeInTheDocument();
        expect(container.querySelector('.profile')).not.toBeInTheDocument();
    });

    it('treats a null body (API response for a non-existent user) as an error', async () => {
        fetchUserMock.mockResolvedValue(null);
        renderUser('/user/ghost');

        expect(await screen.findByText('Could not load user ghost.')).toBeInTheDocument();
    });

    it('sanitizes the about HTML like Angular [innerHTML] did', async () => {
        fetchUserMock.mockResolvedValue({
            ...pg,
            about: '<p>Hi <i>there</i><script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)" onclick="x()">x</a><a href="https://example.com" title="t">ok</a></p>',
        });
        const { container } = renderUser('/user/pg');

        await screen.findByText('pg', { selector: '.name' });
        const about = container.querySelector('.other-details > p') as HTMLElement;
        expect(about.querySelector('script')).toBeNull();
        expect(about.querySelector('img')).toBeNull();
        expect(about.querySelector('i')).toHaveTextContent('there');
        const links = about.querySelectorAll('a');
        expect(links[0]).not.toHaveAttribute('href');
        expect(links[0]).not.toHaveAttribute('onclick');
        expect(links[1]).toHaveAttribute('href', 'https://example.com');
        expect(links[1]).toHaveAttribute('title', 't');
    });

    it('navigates back when the mobile back arrow is clicked', async () => {
        fetchUserMock.mockResolvedValue(pg);
        const { container } = renderUser('/user/pg');

        await screen.findByText('pg', { selector: '.name' });
        act(() => (container.querySelector('.back-button') as HTMLElement).click());

        await waitFor(() => expect(screen.getByText('feed page')).toBeInTheDocument());
    });
});
