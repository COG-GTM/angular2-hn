import { describe, expect, it } from 'vitest';

import Item from './Item';
import { internalStory, jobStory, story } from '../test/fixtures';
import { renderWithProviders, screen } from '../test/renderWithProviders';

describe('Item', () => {
    it('renders an external link when the story url starts with http', () => {
        renderWithProviders(<Item item={story} />);

        const link = screen.getByRole('link', { name: story.title });
        expect(link).toHaveAttribute('href', story.url);
        expect(screen.getByText(`(${story.domain})`)).toBeInTheDocument();
    });

    it('renders an internal item link when the story has no external url', () => {
        renderWithProviders(<Item item={internalStory} />);

        expect(screen.getByRole('link', { name: internalStory.title })).toHaveAttribute(
            'href',
            `/item/${internalStory.id}`
        );
    });

    it('renders points, time ago, user and formatted comment count', () => {
        renderWithProviders(<Item item={story} />);

        expect(screen.getAllByText(story.time_ago).length).toBeGreaterThan(0);
        expect(screen.getByText(`${story.points} ★`)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: story.user }).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/42 comments/).length).toBeGreaterThan(0);
    });

    it('renders "discuss" and hides points for jobs', () => {
        renderWithProviders(<Item item={jobStory} />);

        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText(/discuss/)).not.toBeInTheDocument();
    });

    it('opens external links in a new tab when the setting is enabled', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<Item item={story} />);

        const link = screen.getByRole('link', { name: story.title });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('keeps external links in the same tab by default', () => {
        renderWithProviders(<Item item={story} />);

        expect(screen.getByRole('link', { name: story.title })).not.toHaveAttribute('target');
    });
});
