import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Item } from './Item';
import { renderWithProviders } from '../../test/renderWithProviders';
import { makeStory } from '../../test/fixtures';

describe('Item', () => {
    it('renders an external anchor for stories with a url', () => {
        renderWithProviders(<Item item={makeStory({ url: 'https://example.com/article', title: 'External' })} />);
        const link = screen.getByRole('link', { name: 'External' });
        expect(link).toHaveAttribute('href', 'https://example.com/article');
    });

    it('renders an internal item link for stories without a url', () => {
        renderWithProviders(<Item item={makeStory({ id: 55, url: 'item?id=55', title: 'Ask HN: something' })} />);
        const link = screen.getByRole('link', { name: 'Ask HN: something' });
        expect(link).toHaveAttribute('href', '/item/55');
    });

    it('shows the domain when present', () => {
        renderWithProviders(<Item item={makeStory({ domain: 'example.com' })} />);
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });

    it('hides user, points and comment links for job items', () => {
        renderWithProviders(<Item item={makeStory({ type: 'job', user: 'hr', url: 'https://jobs.example.com' })} />);
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText('★', { exact: false })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /comment/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'hr' })).not.toBeInTheDocument();
    });

    it('applies title font-size and list-spacing inline styles from settings', () => {
        const { container } = renderWithProviders(<Item item={makeStory({ title: 'Styled' })} />, {
            seedStorage: { titleFontSize: '22', listSpacing: '7' },
        });
        const title = screen.getByRole('link', { name: 'Styled' });
        expect(title).toHaveStyle({ fontSize: '22px' });
        const spacingWrapper = container.querySelector('.item-block > div') as HTMLElement;
        expect(spacingWrapper).toHaveStyle({ marginBottom: '7px' });
    });

    it('omits target/rel when open-in-new-tab is disabled', () => {
        renderWithProviders(<Item item={makeStory({ title: 'NoTab' })} />);
        const link = screen.getByRole('link', { name: 'NoTab' });
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
    });

    it('adds target=_blank and rel=noopener when open-in-new-tab is enabled', () => {
        renderWithProviders(<Item item={makeStory({ title: 'NewTab' })} />, {
            seedStorage: { openLinkInNewTab: 'true' },
        });
        const link = screen.getByRole('link', { name: 'NewTab' });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('formats the comment count using the pipe helper output', () => {
        renderWithProviders(<Item item={makeStory({ comments_count: 1 })} />);
        const commentLinks = screen.getAllByRole('link', { name: /1 comment$/ });
        expect(commentLinks.length).toBeGreaterThan(0);
        within(commentLinks[0]).getByText(/1 comment/);
    });
});
