import { screen } from '@testing-library/react';

import { FEED_NAMES } from './models';
import { makeFeedPage } from './test/fixtures';
import { mockFetch, renderApp } from './test/render';

describe('routes', () => {
  it('redirects / to /news/1', async () => {
    const fetchMock = mockFetch(() => makeFeedPage());
    renderApp({ route: '/' });
    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1', expect.anything());
  });

  it.each(FEED_NAMES)('renders the shared feed page for /%s/:page', async (feedType) => {
    const fetchMock = mockFetch(() => makeFeedPage());
    renderApp({ route: `/${feedType}/2` });
    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(`https://node-hnapi.herokuapp.com/${feedType}?page=2`, expect.anything());
  });

  it('renders the item details page for /item/:id', async () => {
    renderApp({ route: '/item/123' });
    expect(await screen.findByTestId('item-details-page')).toHaveAttribute('data-item-id', '123');
  });

  it('renders the user page for /user/:id', async () => {
    renderApp({ route: '/user/pg' });
    expect(await screen.findByTestId('user-page')).toHaveAttribute('data-user-id', 'pg');
  });

  it('applies the theme class from settings to the app root', async () => {
    mockFetch(() => makeFeedPage());
    renderApp({ route: '/news/1', settings: { theme: 'amoledblack' } });
    expect(await screen.findByTestId('theme-root')).toHaveClass('theme-root', 'amoledblack');
  });
});
