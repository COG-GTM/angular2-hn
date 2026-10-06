import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ROUTER_FUTURE } from '../../AppRoutes';
import { SettingsProvider } from '../../settings/SettingsContext';
import { askStory, itemWithComments, jobStory, linkStory, pollItem } from '../../test/fixtures';
import { mockFetch, renderWithProviders } from '../../test/render';
import ItemDetailsPage from './ItemDetailsPage';

function renderItem(id: number) {
  return renderWithProviders(<ItemDetailsPage />, { route: `/item/${id}`, path: '/item/:id' });
}

describe('ItemDetailsPage', () => {
  it('shows the loader, then the item, and scrolls to top', async () => {
    mockFetch({ '/item/1001': itemWithComments });
    renderItem(1001);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(await screen.findByTestId('laptop-header')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Loading' })).not.toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('fetches the item id from the route', async () => {
    const fetchMock = mockFetch({ '/item/1001': linkStory });
    renderItem(1001);
    await screen.findByTestId('laptop-header');
    expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/1001', expect.anything());
  });

  it('renders an external title link with domain and subtext for link items', async () => {
    mockFetch({ '/item/1001': linkStory });
    const { container } = renderItem(1001);
    const header = await screen.findByTestId('laptop-header');
    expect(header).toHaveClass('laptop', 'item-header');
    expect(header).not.toHaveClass('head-margin');
    const title = within(header).getByRole('link', { name: 'A link story' });
    expect(title).toHaveAttribute('href', 'https://example.com/post');
    expect(title).not.toHaveAttribute('target');
    expect(within(header).getByText('(example.com)')).toHaveClass('domain');
    const subtext = header.querySelector('.subtext')!;
    expect(subtext).toHaveTextContent('120 points by alice 2 hours ago | 12 comments');
    expect(within(header).getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
    expect(within(header).getByRole('link', { name: '12 comments' })).toHaveAttribute('href', '/item/1001');
    expect(container.querySelector('.mobile.item-header .title')).toHaveAttribute('href', 'https://example.com/post');
  });

  it('opens external links in a new tab when the setting is on', async () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    mockFetch({ '/item/1001': linkStory });
    renderItem(1001);
    const header = await screen.findByTestId('laptop-header');
    const title = within(header).getByRole('link', { name: 'A link story' });
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
  });

  it('renders an internal title link, content and head-margin for ask items', async () => {
    mockFetch({ '/item/1002': { ...askStory, content: '<p>Question body</p>', comments: [] } });
    const { container } = renderItem(1002);
    const header = await screen.findByTestId('laptop-header');
    expect(header).toHaveClass('item-header', 'head-margin');
    expect(within(header).getByRole('link', { name: 'Ask HN: Something?' })).toHaveAttribute('href', '/item/1002');
    expect(header.querySelector('.domain')).toBeNull();
    expect(header.querySelector('.subtext')).toHaveTextContent('40 points by bob 1 hour ago | 1 comment');
    expect(container.querySelector('.subject')).toContainHTML('<p>Question body</p>');
  });

  it('omits item-header on the laptop header when there are no comments', async () => {
    mockFetch({ '/item/1001': { ...linkStory, comments_count: 0 } });
    renderItem(1001);
    const header = await screen.findByTestId('laptop-header');
    expect(header).not.toHaveClass('item-header');
    expect(within(header).getByRole('link', { name: 'discuss' })).toBeInTheDocument();
  });

  it('hides points, user and comments for jobs', async () => {
    mockFetch({ '/item/1003': { ...jobStory, comments: [] } });
    renderItem(1003);
    const header = await screen.findByTestId('laptop-header');
    expect(header).toHaveClass('item-header');
    const subtext = header.querySelector('.subtext')!;
    expect(subtext).toHaveTextContent(/^3 hours ago$/);
    expect(subtext.querySelector('.item-details')).toBeNull();
    expect(within(header).queryByText(/points/)).not.toBeInTheDocument();
    expect(within(header).queryByText(/discuss|comment/)).not.toBeInTheDocument();
  });

  it('renders poll results with proportional bars', async () => {
    const fetchMock = mockFetch({
      '/item/3001': { points: 30, content: '<p>Tabs</p>' },
      '/item/3002': { points: 10, content: '<p>Spaces</p>' },
      '/item/3000': pollItem,
    });
    const { container } = renderItem(3000);
    await screen.findByTestId('laptop-header');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const options = container.querySelectorAll('.pollResults .pollContent');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Tabs');
    expect(options[0]).toHaveTextContent('30 points');
    expect(options[1]).toHaveTextContent('Spaces');
    expect(options[1]).toHaveTextContent('10 points');
    const bars = screen.getAllByTestId('poll-bar');
    expect(bars[0]).toHaveClass('pollBar');
    expect(bars[0]).toHaveStyle({ width: '75%' });
    expect(bars[1]).toHaveStyle({ width: '25%' });
    expect(container.querySelector('.subject')).toHaveTextContent('Vote!');
  });

  it('does not render poll results for non-poll items', async () => {
    mockFetch({ '/item/1001': linkStory });
    const { container } = renderItem(1001);
    await screen.findByTestId('laptop-header');
    expect(container.querySelector('.pollResults')).toBeNull();
  });

  it('shows an error message when the fetch fails', async () => {
    mockFetch({ '/item/1001': new Error('network') });
    renderItem(1001);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
    expect(screen.queryByRole('status', { name: 'Loading' })).not.toBeInTheDocument();
  });

  it('shows an error message on HTTP errors', async () => {
    mockFetch({ '/item/1001': { __status: 500 } });
    renderItem(1001);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
  });

  it('renders top-level comments with nested replies', async () => {
    mockFetch({ '/item/1001': itemWithComments });
    const { container } = renderItem(1001);
    await screen.findByTestId('laptop-header');
    const list = container.querySelector('ul.comment-list')!;
    expect(list.children).toHaveLength(2);
    expect(within(list as HTMLElement).getByText('Top level comment')).toBeInTheDocument();
    expect(within(list as HTMLElement).getByText('Nested reply')).toBeInTheDocument();
    expect(list.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
  });

  it('aborts the in-flight request on unmount', async () => {
    const fetchMock = mockFetch({ '/item/1001': linkStory });
    const { unmount } = renderItem(1001);
    const signal = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].signal!;
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it('sanitizes item and poll HTML', async () => {
    mockFetch({
      '/item/3001': { points: 1, content: '<p onclick="x()">Tabs</p><script>alert(1)</script>' },
      '/item/3002': { points: 1, content: 'Spaces' },
      '/item/3000': { ...pollItem, content: '<p>Vote!</p><iframe src="https://evil.example"></iframe>' },
    });
    const { container } = renderItem(3000);
    await screen.findByTestId('laptop-header');
    expect(container.querySelector('script, iframe, [onclick]')).toBeNull();
    expect(container.querySelector('.subject')!.innerHTML).toBe('<p>Vote!</p>');
  });

  it('scrolls to top and refetches when the item id changes', async () => {
    mockFetch({ '/item/1001': linkStory, '/item/1002': { ...askStory, comments: [] } });
    render(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/item/1001']} future={ROUTER_FUTURE}>
          <Link to="/item/1002">next item</Link>
          <Routes>
            <Route path="/item/:id" element={<ItemDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );
    await screen.findAllByText('A link story');
    const callsBefore = vi.mocked(window.scrollTo).mock.calls.length;
    await userEvent.click(screen.getByRole('link', { name: 'next item' }));
    expect((await screen.findAllByText('Ask HN: Something?')).length).toBeGreaterThan(0);
    expect(vi.mocked(window.scrollTo).mock.calls.length).toBe(callsBefore + 1);
  });

  it('back button works from the keyboard', async () => {
    mockFetch({ '/item/1001': linkStory });
    render(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/news/1', '/item/1001']} initialIndex={1} future={ROUTER_FUTURE}>
          <Routes>
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/news/:page" element={<div data-testid="previous-page" />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );
    await screen.findByTestId('laptop-header');
    screen.getByRole('button', { name: 'Back' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByTestId('previous-page')).toBeInTheDocument());
  });

  it('back button navigates to the previous history entry', async () => {
    mockFetch({ '/item/1001': linkStory });
    render(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/news/1', '/item/1001']} initialIndex={1} future={ROUTER_FUTURE}>
          <Routes>
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/news/:page" element={<div data-testid="previous-page" />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );
    await screen.findByTestId('laptop-header');
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByTestId('previous-page')).toBeInTheDocument());
  });
});
