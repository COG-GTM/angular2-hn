import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { Item } from './Item';

beforeEach(() => {
    localStorage.clear();
});

describe('Item', () => {
    it('links the title to the external url and shows the domain', () => {
        renderWithProviders(<Item item={makeStory()} />);
        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(screen.getByText('(example.com)')).toHaveClass('domain');
    });

    it('opens external links in a new tab when the setting is on', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        renderWithProviders(<Item item={makeStory()} />);
        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('links the title internally when the url is not external', () => {
        renderWithProviders(<Item item={makeStory({ id: 7, url: 'item?id=7', domain: '' })} />);
        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/7');
        expect(screen.queryByText(/\(.*\)/)).not.toBeInTheDocument();
    });

    it('renders points, user and comment count in both subtext blocks', () => {
        const { container } = renderWithProviders(<Item item={makeStory({ id: 9, comments_count: 1 })} />);
        const palm = container.querySelector('.subtext-palm')!;
        const laptop = container.querySelector('.subtext-laptop')!;
        expect(palm).toHaveTextContent('42 ★');
        expect(palm).toHaveTextContent('• 1 comment');
        expect(laptop).toHaveTextContent('42 points by alice');
        expect(laptop).toHaveTextContent('2 hours ago | 1 comment');
        expect(screen.getAllByRole('link', { name: 'alice' })[0]).toHaveAttribute('href', '/user/alice');
        expect(screen.getAllByRole('link', { name: /1 comment/ })[0]).toHaveAttribute('href', '/item/9');
    });

    it('shows "discuss" when there are no comments', () => {
        renderWithProviders(<Item item={makeStory({ comments_count: 0 })} />);
        expect(screen.getAllByRole('link', { name: /discuss/ })).toHaveLength(2);
    });

    it('hides points, user and comments for jobs', () => {
        const { container } = renderWithProviders(<Item item={makeStory({ type: 'job' })} />);
        expect(container).not.toHaveTextContent('★');
        expect(container).not.toHaveTextContent('points by');
        expect(screen.queryByRole('link', { name: 'alice' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /comments/ })).not.toBeInTheDocument();
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent('2 hours ago');
    });

    it('applies the title font size and list spacing settings', () => {
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '12');
        const { container } = renderWithProviders(<Item item={makeStory()} />);
        expect(screen.getByRole('link', { name: 'A story' })).toHaveStyle({ fontSize: '20px' });
        expect(container.querySelector('.item-block')).toHaveStyle({ marginBottom: '12px' });
    });
});
