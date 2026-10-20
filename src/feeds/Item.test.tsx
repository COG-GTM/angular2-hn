import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { Story } from '../shared/models';
import { loadInitialSettings, useSettingsStore } from '../shared/store/settings';
import { Item } from './Item';

const story: Story = {
    id: 123,
    title: 'A story with a URL',
    points: 42,
    user: 'pg',
    time: 1,
    time_ago: '3 hours ago',
    type: 'link',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments: [],
    comments_count: 7,
};

const askStory: Story = {
    ...story,
    id: 456,
    title: 'Ask HN: something?',
    type: 'story',
    url: 'item?id=456',
    domain: undefined,
    comments_count: 1,
};

const job: Story = {
    ...story,
    id: 789,
    title: 'Startup (YC W20) is hiring',
    points: null,
    user: null,
    type: 'job',
    url: 'https://jobs.example.com',
    domain: 'jobs.example.com',
    comments_count: 0,
};

function renderItem(item: Story) {
    return render(
        <MemoryRouter>
            <Item item={item} />
        </MemoryRouter>
    );
}

describe('Item', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal(
            'matchMedia',
            vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
        );
        useSettingsStore.setState(loadInitialSettings());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('links the title to the external url with the domain and renders subtext', () => {
        const { container } = renderItem(story);

        const title = screen.getByRole('link', { name: 'A story with a URL' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).toHaveClass('title');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(title).toHaveStyle({ fontSize: '16px' });
        expect(screen.getByText('(example.com)')).toHaveClass('domain');

        expect(container.querySelector('.app-item')).toHaveClass('item-block');
        expect(container.querySelector('.app-item > div')).toHaveStyle({ marginBottom: '0px' });

        const userLinks = screen.getAllByRole('link', { name: 'pg' });
        expect(userLinks).toHaveLength(2);
        userLinks.forEach((link) => expect(link).toHaveAttribute('href', '/user/pg'));

        expect(screen.getByText('42 ★')).toHaveClass('right');
        expect(screen.getByText(/42 points by/)).toBeInTheDocument();
        expect(screen.getAllByText(/3 hours ago/)).toHaveLength(2);

        const commentLinks = screen.getAllByRole('link', { name: /7 comments/ });
        expect(commentLinks).toHaveLength(2);
        commentLinks.forEach((link) => expect(link).toHaveAttribute('href', '/item/123'));
        expect(container.querySelector('.subtext-laptop .item-details')).toBeInTheDocument();
    });

    it('links the title to the item page when the story has no http url', () => {
        renderItem(askStory);

        const title = screen.getByRole('link', { name: 'Ask HN: something?' });
        expect(title).toHaveAttribute('href', '/item/456');
        expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /1 comment$/ })).toHaveLength(2);
    });

    it('renders jobs without points, user or comments', () => {
        const { container } = renderItem(job);

        expect(screen.getByRole('link', { name: 'Startup (YC W20) is hiring' })).toHaveAttribute(
            'href',
            'https://jobs.example.com'
        );
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText(/★/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /discuss/ })).not.toBeInTheDocument();
        expect(screen.getAllByRole('link')).toHaveLength(1);
        expect(container.querySelector('.subtext-laptop .item-details')).not.toBeInTheDocument();
        expect(screen.getAllByText(/3 hours ago/)).toHaveLength(2);
    });

    it('formats zero comments as "discuss"', () => {
        renderItem({ ...story, comments_count: 0 });

        expect(screen.getAllByRole('link', { name: /discuss/ })).toHaveLength(2);
    });

    it('opens external links in a new tab when the setting is on', () => {
        useSettingsStore.getState().toggleOpenLinksInNewTab();
        renderItem(story);

        const title = screen.getByRole('link', { name: 'A story with a URL' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('applies title font size and list spacing from the settings store', () => {
        useSettingsStore.getState().setFont('22');
        useSettingsStore.getState().setSpacing('12');
        const { container } = renderItem(story);

        expect(screen.getByRole('link', { name: 'A story with a URL' })).toHaveStyle({ fontSize: '22px' });
        expect(container.querySelector('.app-item > div')).toHaveStyle({ marginBottom: '12px' });
    });

    it('reacts to settings changes after mount', () => {
        renderItem(story);
        expect(screen.getByRole('link', { name: 'A story with a URL' })).toHaveStyle({ fontSize: '16px' });

        act(() => useSettingsStore.getState().setFont('30'));

        expect(screen.getByRole('link', { name: 'A story with a URL' })).toHaveStyle({ fontSize: '30px' });
    });
});
