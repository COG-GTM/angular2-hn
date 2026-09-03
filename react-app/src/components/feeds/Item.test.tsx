import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeStory, renderWithProviders } from '../../test/utils';
import { Item } from './Item';

describe('Item', () => {
    it('links externally when the story has a url', () => {
        renderWithProviders(<Item item={makeStory()} />);

        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });

    it('opens external links in a new tab when the setting is on', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<Item item={makeStory()} />);

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('target', '_blank');
    });

    it('links to the discussion for self posts', () => {
        renderWithProviders(<Item item={makeStory({ url: 'item?id=1', type: 'ask' })} />);

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/1');
        expect(screen.getAllByText('3 comments').length).toBeGreaterThan(0);
    });

    it('hides points and comments for jobs', () => {
        renderWithProviders(<Item item={makeStory({ type: 'job' })} />);

        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText(/comments/)).not.toBeInTheDocument();
    });

    it('applies the configured font size and spacing', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '9');

        renderWithProviders(<Item item={makeStory()} />);

        expect(screen.getByRole('link', { name: 'A story' })).toHaveStyle({ fontSize: '22px' });
    });
});
