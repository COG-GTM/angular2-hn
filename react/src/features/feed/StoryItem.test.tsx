import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { StoryItem } from './StoryItem';
import { Story } from '../../shared/models';
import { SettingsProvider } from '../../shared/settings/SettingsContext';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 10,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago' as unknown as number,
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function renderStory(item: Story) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <StoryItem item={item} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('StoryItem', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders external URLs and their domain', () => {
        renderStory(makeStory());

        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveClass('title');
        expect(title).toHaveAttribute('href', 'https://example.com/story');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(screen.getByText('(example.com)')).toHaveClass('domain');
    });

    it('renders internal URLs as item links without a domain', () => {
        renderStory(makeStory({ url: 'item?id=1', domain: 'example.com' }));

        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', '/item/1');
        expect(screen.queryByText('(example.com)')).not.toBeInTheDocument();
    });

    it('opens external links in a new tab when configured', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderStory(makeStory());

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('target', '_blank');
        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('rel', 'noopener');
    });

    it('applies configured title size and list spacing', () => {
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '12');

        const { container } = renderStory(makeStory());

        expect(screen.getByRole('link', { name: 'A story' })).toHaveStyle({ fontSize: '20px' });
        expect(container.firstElementChild).toHaveStyle({ marginBottom: '12px' });
    });

    it('hides an empty domain', () => {
        renderStory(makeStory({ domain: '' }));

        expect(document.querySelector('.domain')).not.toBeInTheDocument();
    });

    it('omits user, points, and comments for jobs', () => {
        const { container } = renderStory(makeStory({ type: 'job', url: 'item?id=1' }));

        expect(screen.queryByRole('link', { name: 'alice' })).not.toBeInTheDocument();
        expect(screen.queryByText(/10 ★/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /discuss|comments?/ })).not.toBeInTheDocument();
        expect(container.querySelector('.item-details')).not.toBeInTheDocument();
        expect(container.querySelectorAll('.subtext-palm .details')).toHaveLength(1);
    });

    it('renders user links and responsive details for non-jobs', () => {
        const { container } = renderStory(makeStory());

        expect(screen.getAllByRole('link', { name: 'alice' })).toHaveLength(2);
        expect(screen.getAllByRole('link', { name: 'alice' })[0]).toHaveAttribute('href', '/user/alice');
        expect(container.querySelector('.item-details')).toBeInTheDocument();
        expect(container.textContent).toContain(' • 5 comments');
        expect(container.textContent).toContain(' | 5 comments');
        expect(container.textContent).toContain('10 points by');
    });

    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [5, '5 comments'],
    ])('formats %s comments', (commentsCount, expected) => {
        renderStory(makeStory({ comments_count: commentsCount }));

        expect(screen.getAllByText(expected).length).toBeGreaterThan(0);
    });
});
