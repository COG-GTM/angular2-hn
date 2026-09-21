import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from './AppRoutes';

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AppRoutes />
        </MemoryRouter>
    );
}

describe('AppRoutes', () => {
    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed with its feed type', (feedType) => {
        const { container } = renderAt(`/${feedType}/2`);

        expect(container.querySelector('.news-list')).toHaveAttribute('data-feed-type', feedType);
    });

    it('renders item details', () => {
        const { container } = renderAt('/item/123');

        expect(container.querySelector('.item-details')).toBeInTheDocument();
    });

    it('renders a user profile', () => {
        const { container } = renderAt('/user/pg');

        expect(container.querySelector('.user-profile')).toBeInTheDocument();
    });

    it('redirects the root path to the first news page', () => {
        const { container } = renderAt('/');

        expect(container.querySelector('.news-list')).toHaveAttribute('data-feed-type', 'news');
    });
});
