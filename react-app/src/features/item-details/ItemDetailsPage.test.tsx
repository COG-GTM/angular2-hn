import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';

import { fetchItemContent } from '../../api/hackernews';
import type { Story } from '../../models';
import { renderWithProviders } from '../../test/renderWithProviders';
import ItemDetailsPage from './ItemDetailsPage';

vi.mock('../../api/hackernews');
const fetchMock = fetchItemContent as Mock;

const story: Story = {
  ...{ id: 1, title: 'A story', points: 42, user: 'alice', time: 0, time_ago: '3 hours ago', type: 'link' },
  ...{ url: 'https://example.com/post', domain: 'example.com', comments_count: 1 },
  comments: [{ id: 10, level: 0, user: 'bob', time: 0, time_ago: '1 hour ago', content: 'nice', comments: [] }],
};

function renderItem(item: Partial<Story> | null, route = '/item/1') {
  if (item) fetchMock.mockResolvedValue({ ...story, ...item });
  return renderWithProviders(<ItemDetailsPage />, { route, path: '/item/:id' });
}
const findTitles = () => screen.findAllByRole('link', { name: /story/i });

describe('ItemDetailsPage', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('shows the loader while loading and aborts on unmount', () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    const { container, unmount } = renderItem(null, '/item/7');
    expect(container.querySelector('.loading-section')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(7, expect.any(AbortSignal));
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    unmount();
    expect((fetchMock.mock.calls[0][1] as AbortSignal).aborted).toBe(true);
  });

  it('shows the error message on failure', async () => {
    fetchMock.mockRejectedValue(new Error('boom'));
    const { container } = renderItem(null);
    expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    expect(container.querySelector('.loading-section')).not.toBeInTheDocument();
  });

  it('renders a link story with both headers, subtext and comments', async () => {
    const { container } = renderItem({});
    const titles = await findTitles();
    expect(titles).toHaveLength(2);
    titles.forEach((a) => expect(a).toHaveAttribute('href', 'https://example.com/post'));
    expect(titles[0]).not.toHaveAttribute('target');
    expect(screen.getByText('(example.com)')).toHaveClass('domain');
    expect(container.querySelector('.subtext')).toHaveTextContent('42 points by alice3 hours ago | 1 comment');
    expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
    expect(screen.getByRole('link', { name: '1 comment' })).toHaveAttribute('href', '/item/1');
    expect(container.querySelector('.laptop')).toHaveClass('item-header');
    expect(container.querySelector('.comment-list .app-comment')).toHaveTextContent('nice');
  });

  it('opens external links in a new tab when enabled', async () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    renderItem({});
    const titles = (await findTitles()) as HTMLAnchorElement[];
    titles.forEach((a) => expect([a.target, a.rel]).toEqual(['_blank', 'noopener']));
  });

  it('renders an uncommented self post with an internal title link and HTML content', async () => {
    const content = '<p>Ask <b>body</b></p>';
    const { container } = renderItem({ type: 'ask', url: 'item?id=1', content, comments_count: 0, comments: [] });
    (await findTitles()).forEach((a) => expect(a).toHaveAttribute('href', '/item/1'));
    expect(screen.queryByText('(example.com)')).not.toBeInTheDocument();
    expect(container.querySelector('.subject b')).toHaveTextContent('body');
    expect(screen.getByRole('link', { name: 'discuss' })).toBeInTheDocument();
    expect(container.querySelector('.laptop')).not.toHaveClass('item-header');
  });

  it('renders a job without points or comment count', async () => {
    const { container } = renderItem({ type: 'job', points: null, user: null, comments_count: 0, comments: [] });
    await findTitles();
    expect(container.querySelector('.subtext')).toHaveTextContent(/^3 hours ago$/);
    expect(container.querySelector('.item-details')).not.toBeInTheDocument();
    expect(container.querySelector('.laptop')).toHaveClass('item-header');
  });

  it('renders poll options with proportional bars', async () => {
    const poll = [{ content: '<b>Yes</b>', points: 30 }, { content: 'No', points: 10 }]; // prettier-ignore
    const { container } = renderItem({ type: 'poll', poll, poll_votes_count: 40 });
    expect(await screen.findByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('30 points')).toBeInTheDocument();
    const bars = container.querySelectorAll('.pollBar');
    expect(bars[0]).toHaveStyle({ width: '75%' });
    expect(bars[1]).toHaveStyle({ width: '25%' });
  });

  it('refetches when the id changes and goes back with the back button', async () => {
    fetchMock.mockImplementation((id: number) => Promise.resolve({ ...story, id, title: `Story ${id}` }));
    const { router, container } = renderItem(null);
    await screen.findAllByRole('link', { name: 'Story 1' });
    await act(() => router.navigate('/item/2'));
    await screen.findAllByRole('link', { name: 'Story 2' });
    expect(fetchMock).toHaveBeenLastCalledWith(2, expect.any(AbortSignal));
    await userEvent.click(container.querySelector('.back-button')!);
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/item/1'));
    expect(await screen.findAllByRole('link', { name: 'Story 1' })).toHaveLength(2);
  });
});
