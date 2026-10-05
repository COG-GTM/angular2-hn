import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import type { FeedName } from '../../models';
import { makeFeedPage, makeStory } from '../../test/fixtures';
import { mockFetch, renderApp, renderWithProviders } from '../../test/render';
import FeedPage from './FeedPage';

function renderFeed(feedType: FeedName, page: number) {
  return renderWithProviders(
    <Routes>
      <Route path={`/${feedType}/:page`} element={<FeedPage feedType={feedType} />} />
    </Routes>,
    { route: `/${feedType}/${page}` }
  );
}

describe('FeedPage', () => {
  it('shows the loader, then the stories for the requested feed and page', async () => {
    const fetchMock = mockFetch(() => makeFeedPage(31));
    renderFeed('newest', 2);

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    expect(await screen.findByText('Story 31')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/newest?page=2', expect.anything());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(30);
  });

  it('numbers the list from (page - 1) * 30 + 1', async () => {
    mockFetch(() => makeFeedPage());
    const { container } = renderFeed('news', 3);
    await screen.findByText('Story 1');
    expect(container.querySelector('ol')).toHaveAttribute('start', '61');
    expect(container.querySelector('ol')).toHaveClass('list-margin');
  });

  it('hides Prev on page 1 and shows More when the page is full', async () => {
    mockFetch(() => makeFeedPage());
    renderFeed('news', 1);
    expect(await screen.findByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
    expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
  });

  it('shows Prev and hides More when fewer than 30 stories are returned', async () => {
    mockFetch(() => makeFeedPage(1, 12));
    renderFeed('show', 4);
    expect(await screen.findByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/show/3');
    expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
  });

  it('renders an empty list (no More link) when the feed has no stories', async () => {
    mockFetch(() => []);
    const { container } = renderFeed('ask', 1);
    await waitFor(() => expect(container.querySelector('ol')).toBeInTheDocument());
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
  });

  it('shows the Angular error message when the feed fails to load', async () => {
    mockFetch(() => undefined);
    renderFeed('ask', 1);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load ask stories.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the YC jobs header and no list margin on the jobs feed', async () => {
    mockFetch(() => [makeStory({ id: 7, type: 'job', title: 'Acme is hiring' })]);
    const { container } = renderFeed('jobs', 1);
    expect(await screen.findByText(/These are jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
      'href',
      'https://triplebyte.com/?ref=yc_jobs'
    );
    expect(container.querySelector('ol')).not.toHaveClass('list-margin');
  });

  it('does not show the jobs header on other feeds', async () => {
    mockFetch(() => makeFeedPage());
    renderFeed('news', 1);
    await screen.findByText('Story 1');
    expect(screen.queryByText(/funded by Y Combinator/)).not.toBeInTheDocument();
  });

  it('navigates to the next page and scrolls to the top', async () => {
    mockFetch((url) => (url.endsWith('page=2') ? makeFeedPage(31) : makeFeedPage(1)));
    renderApp({ route: '/news/1' });
    await screen.findByText('Story 1');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    vi.mocked(window.scrollTo).mockClear();

    await userEvent.click(screen.getByRole('link', { name: 'More ›' }));
    expect(await screen.findByText('Story 31')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/news/2');
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(30);
    expect(document.querySelector('ol')).toHaveAttribute('start', '31');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('keeps the current stories on screen (no loader) until the next page arrives', async () => {
    let releasePage2: () => void = () => {};
    const page2 = new Promise<void>((resolve) => (releasePage2 = resolve));
    const fetchMock = mockFetch(() => makeFeedPage(1));
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('page=2')) await page2;
      const body = url.endsWith('page=2') ? makeFeedPage(31) : makeFeedPage(1);
      return new Response(JSON.stringify(body), { status: 200 });
    });
    renderApp({ route: '/news/1' });
    await screen.findByText('Story 1');

    await userEvent.click(screen.getByRole('link', { name: 'More ›' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/news/2');
    expect(screen.getByText('Story 1')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(document.querySelector('ol')).toHaveAttribute('start', '1');

    releasePage2();
    expect(await screen.findByText('Story 31')).toBeInTheDocument();
    expect(document.querySelector('ol')).toHaveAttribute('start', '31');
  });
});
