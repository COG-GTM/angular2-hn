import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import { mockMatchMedia } from '../test/setup';
import Item from './Item';
import { makeStory } from '../test/fixtures';

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('Item', () => {
    it('renders an external link with the story url', () => {
        const item = makeStory({ id: 7, title: 'External story', url: 'https://foo.bar/x', domain: 'foo.bar' });
        renderWithProviders(<Item item={item} />);
        const link = screen.getByRole('link', { name: 'External story' });
        expect(link).toHaveAttribute('href', 'https://foo.bar/x');
    });

    it('does not set target/rel when openLinkInNewTab is false', () => {
        const item = makeStory({ title: 'No new tab', url: 'https://foo.bar/x' });
        renderWithProviders(<Item item={item} />);
        const link = screen.getByRole('link', { name: 'No new tab' });
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
    });

    it('sets target=_blank and rel=noopener when openLinkInNewTab is true', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        const item = makeStory({ title: 'New tab', url: 'https://foo.bar/x' });
        renderWithProviders(<Item item={item} />);
        const link = screen.getByRole('link', { name: 'New tab' });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('renders an internal /item link when the story has no external url', () => {
        const item = makeStory({ id: 55, title: 'Ask HN', url: '', domain: '' });
        renderWithProviders(<Item item={item} />);
        const link = screen.getByRole('link', { name: 'Ask HN' });
        expect(link).toHaveAttribute('href', '/item/55');
    });

    it('shows the domain when present', () => {
        const item = makeStory({ title: 'Has domain', url: 'https://foo.bar/x', domain: 'foo.bar' });
        renderWithProviders(<Item item={item} />);
        expect(screen.getByText('(foo.bar)')).toBeInTheDocument();
    });

    it('omits points, user and comments for job-type items', () => {
        const item = makeStory({ id: 9, title: 'A job', type: 'job', url: 'https://jobs.example/1', user: 'hr' });
        renderWithProviders(<Item item={item} />);
        expect(screen.queryByRole('link', { name: 'hr' })).not.toBeInTheDocument();
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });

    it('applies the font-size and list-spacing settings', () => {
        localStorage.setItem('titleFontSize', '24');
        localStorage.setItem('listSpacing', '12');
        const item = makeStory({ title: 'Styled', url: 'https://foo.bar/x' });
        const { container } = renderWithProviders(<Item item={item} />);
        const block = container.querySelector('.item-block') as HTMLElement;
        expect(block.style.marginBottom).toBe('12px');
        const link = screen.getByRole('link', { name: 'Styled' });
        expect(link.style.fontSize).toBe('24px');
    });

    it('formats the comment count like the old pipe', () => {
        const item = makeStory({ id: 3, title: 'Discuss me', url: 'https://foo.bar/x', comments_count: 1 });
        renderWithProviders(<Item item={item} />);
        const laptop = document.querySelector('.subtext-laptop') as HTMLElement;
        expect(within(laptop).getByText('1 comment')).toBeInTheDocument();
    });

    it('shows "discuss" when there are no comments', () => {
        const item = makeStory({ id: 4, title: 'Zero', url: 'https://foo.bar/x', comments_count: 0 });
        renderWithProviders(<Item item={item} />);
        const laptop = document.querySelector('.subtext-laptop') as HTMLElement;
        expect(within(laptop).getByText('discuss')).toBeInTheDocument();
    });
});
