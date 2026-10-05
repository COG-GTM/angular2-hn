import { screen } from '@testing-library/react';

import { FEED_NAMES } from './models';
import { makeUser } from './test/fixtures';
import { mockFetch, renderApp } from './test/render';

describe('routes', () => {
  it('redirects / to /news/1', async () => {
    renderApp({ route: '/' });
    expect(await screen.findByTestId('feed-page')).toHaveAttribute('data-feed-type', 'news');
    expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
  });

  it.each(FEED_NAMES)('renders the shared feed page for /%s/:page', async (feedType) => {
    renderApp({ route: `/${feedType}/2` });
    const page = await screen.findByTestId('feed-page');
    expect(page).toHaveAttribute('data-feed-type', feedType);
    expect(page).toHaveAttribute('data-page', '2');
  });

  it('renders the item details page for /item/:id', async () => {
    renderApp({ route: '/item/123' });
    expect(await screen.findByTestId('item-details-page')).toHaveAttribute('data-item-id', '123');
  });

  it('renders the user page for /user/:id', async () => {
    mockFetch(() => makeUser({ id: 'pg' }));
    renderApp({ route: '/user/pg' });
    expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
  });

  it('applies the theme class from settings to the app root', async () => {
    renderApp({ route: '/news/1', settings: { theme: 'amoledblack' } });
    expect(await screen.findByTestId('theme-root')).toHaveClass('theme-root', 'amoledblack');
  });
});
