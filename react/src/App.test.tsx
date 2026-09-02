import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { fetchFeed, fetchItemContent, fetchUser } from './api/hackernews-api';
import App from './App';
import type { Story, User } from './models';
import { mockMatchMedia } from './test/matchMedia';

vi.mock('./api/hackernews-api');

const story = {
    id: 1,
    title: 'Integrated story',
    points: 10,
    user: 'pg',
    time_ago: '1 hour ago',
    type: 'link',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments: [],
    comments_count: 0,
} as unknown as Story;

const user = { id: 'pg', karma: 42, created: '1 year ago', about: '<b>bio</b>' } as unknown as User;

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <App />
        </MemoryRouter>
    );
}

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
        mockMatchMedia(false);
        vi.stubGlobal('scrollTo', vi.fn());
        vi.mocked(fetchFeed).mockResolvedValue([story]);
        vi.mocked(fetchItemContent).mockResolvedValue(story);
        vi.mocked(fetchUser).mockResolvedValue(user);
    });

    it('renders header, footer and the news feed inside the theme wrapper for /', async () => {
        const { container } = renderAt('/');
        expect(container.firstElementChild).toHaveClass('default');
        expect(container.querySelector('.wrapper header, .wrapper .header')).not.toBeNull();
        expect(await screen.findByText('Integrated story')).toBeInTheDocument();
        expect(fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
        expect(container.querySelector('#footer')).not.toBeNull();
    });

    it('routes feed types to the Feed component with the saved theme applied', async () => {
        localStorage.setItem('theme', 'night');
        const { container } = renderAt('/ask/2');
        expect(container.firstElementChild).toHaveClass('night');
        await screen.findByText('Integrated story');
        expect(fetchFeed).toHaveBeenCalledWith('ask', 2, expect.any(AbortSignal));
    });

    it('lazy-loads the item details page', async () => {
        renderAt('/item/1');
        expect(await screen.findAllByText('Integrated story')).not.toHaveLength(0);
        expect(fetchItemContent).toHaveBeenCalledWith(1, expect.any(AbortSignal));
    });

    it('lazy-loads the user profile page', async () => {
        renderAt('/user/pg');
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(fetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
    });
});
