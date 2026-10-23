import { act, screen } from '@testing-library/react';
import { Link } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { apiUrls } from '../../api';
import { deferred, mockFetch, renderWithProviders, textResponse } from '../../test';
import type { User } from '../../types';
import { UserPage } from './UserPage';

const pg: User = {
    id: 'pg',
    created: '19 years ago',
    created_time: 1160418092,
    karma: 157316,
    about: 'Bug fixer. <a href="item?id=1">link</a><script>alert(1)</script><pre>code</pre>',
};

function renderUser(route = '/user/pg', otherRoutes = {}) {
    return renderWithProviders(<UserPage />, { route, path: '/user/:id', otherRoutes });
}

describe('UserPage', () => {
    it('shows the loader while the profile loads', async () => {
        const pending = deferred();
        mockFetch({ [apiUrls.user('pg')]: () => pending.promise });
        renderUser();
        expect(screen.getByRole('status')).toBeInTheDocument();
        await act(async () => pending.resolve(pg));
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renders id, karma, created and sanitized about HTML', async () => {
        const { callsTo } = mockFetch({ [apiUrls.user('pg')]: pg });
        const { container } = renderUser();
        expect(await screen.findByText('157316 ★')).toBeInTheDocument();
        expect(callsTo('https://api.hnpwa.com/v0/user/pg.json')).toHaveLength(1);
        expect(container.querySelector('.main-details .name')).toHaveTextContent(/^pg$/);
        expect(container.querySelector('.main-details .age')).toHaveTextContent('Created 19 years ago');

        const about = container.querySelector('.other-details p')!;
        expect(about).toHaveTextContent('Bug fixer.');
        expect(about.querySelector('script')).toBeNull();
        expect(about.querySelector('pre')).toHaveTextContent('code');
        expect(about.querySelector('a')).toHaveAttribute('href', 'https://news.ycombinator.com/item?id=1');
        expect(about.querySelector('a')).toHaveAttribute('rel', 'nofollow noopener noreferrer');
    });

    it('omits .other-details when the user has no about', async () => {
        mockFetch({ [apiUrls.user('nobio')]: { id: 'nobio', created: '2 years ago', karma: 1 } });
        const { container } = renderUser('/user/nobio');
        expect(await screen.findByText('1 ★')).toBeInTheDocument();
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it.each([
        ['null body', null],
        ['non-JSON body', textResponse("Cannot read property 'apply' of undefined")],
        ['HTTP error', textResponse('Not found', 404)],
    ])('shows the error message for an unknown user (%s)', async (_label, response) => {
        mockFetch({ [apiUrls.user('nosuchuser')]: response });
        renderUser('/user/nosuchuser');
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user nosuchuser.');
        expect(document.querySelector('.profile')).toBeNull();
    });

    it('scrolls to top on mount', async () => {
        mockFetch({ [apiUrls.user('pg')]: pg });
        renderUser();
        await screen.findByText('Profile: pg');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('back button navigates back by click and keyboard', async () => {
        mockFetch({ [apiUrls.user('pg')]: pg });
        const { user } = renderWithProviders(<UserPage />, {
            route: '/news/1',
            path: '/user/:id',
            otherRoutes: { '/news/:page': <NewsWithLink /> },
        });
        await user.click(screen.getByRole('link', { name: 'pg' }));
        const back = await screen.findByRole('button', { name: 'Back' });
        await user.click(back);
        expect(await screen.findByTestId('news')).toBeInTheDocument();

        await user.click(screen.getByRole('link', { name: 'pg' }));
        (await screen.findByRole('button', { name: 'Back' })).focus();
        await user.keyboard('{Enter}');
        expect(await screen.findByTestId('news')).toBeInTheDocument();
    });

    it('refetches when the :id param changes', async () => {
        const { callsTo } = mockFetch({
            [apiUrls.user('pg')]: pg,
            [apiUrls.user('dang')]: { id: 'dang', created: '18 years ago', karma: 42 },
        });
        const { user } = renderWithProviders(<UserPageWithLink />, { route: '/user/pg', path: '/user/:id' });
        expect(await screen.findByText('157316 ★')).toBeInTheDocument();
        await user.click(screen.getByRole('link', { name: 'to dang' }));
        expect(await screen.findByText('42 ★')).toBeInTheDocument();
        expect(screen.getByText('Profile: dang')).toBeInTheDocument();
        expect(callsTo(apiUrls.user('dang'))).toHaveLength(1);
    });
});

function NewsWithLink() {
    return (
        <div data-testid="news">
            <Link to="/user/pg">pg</Link>
        </div>
    );
}

function UserPageWithLink() {
    return (
        <>
            <Link to="/user/dang">to dang</Link>
            <UserPage />
        </>
    );
}
