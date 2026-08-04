import { screen } from '@testing-library/react';

import { Story } from '../../shared/models';
import { renderWithProviders } from '../../test-utils';
import Item from './Item';

const story: Story = {
    id: 42,
    title: 'A React story',
    points: 128,
    user: 'pg',
    time: 1600000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments_count: 3,
};

beforeEach(() => {
    localStorage.clear();
});

describe('Item', () => {
    it('renders the title, domain, points, user and comment count', () => {
        renderWithProviders(<Item item={story} />);

        expect(screen.getByRole('link', { name: story.title })).toHaveAttribute('href', story.url);
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getByText('128 ★')).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'pg' })).toHaveLength(2);
        expect(screen.getAllByText(/3 comments/)).not.toHaveLength(0);
    });

    it('omits the external link attributes when links open in the same tab', () => {
        renderWithProviders(<Item item={story} />);

        const title = screen.getByRole('link', { name: story.title });

        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
    });

    it('adds the external link attributes when links open in a new tab', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<Item item={story} />);

        const title = screen.getByRole('link', { name: story.title });

        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('applies the configured font size and list spacing', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '12');

        const { container } = renderWithProviders(<Item item={story} />);

        expect(container.firstElementChild).toHaveStyle({ marginBottom: '12px' });
        expect(screen.getByRole('link', { name: story.title })).toHaveStyle({ fontSize: '22px' });
    });

    it('links to the item route when the story has no url', () => {
        renderWithProviders(<Item item={{ ...story, url: undefined, domain: undefined }} />);

        expect(screen.getByRole('link', { name: story.title })).toHaveAttribute('href', '/item/42');
    });

    it('hides the points, user and comment links for job postings', () => {
        renderWithProviders(<Item item={{ ...story, type: 'job' }} />);

        expect(screen.queryByText('128 ★')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
        expect(screen.queryByText(/comments/)).not.toBeInTheDocument();
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });
});
