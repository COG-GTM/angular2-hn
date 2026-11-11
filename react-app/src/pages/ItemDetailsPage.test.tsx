import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { fetchItemContent } from '../api/hackerNewsApi';
import type { Comment, Story } from '../models';
import { SettingsProvider } from '../settings';
import { AppRoutes } from '../routes';

vi.mock('../api/hackerNewsApi', () => ({ fetchItemContent: vi.fn() }));
const comment = (id: number, user: string, comments: Comment[] = [], deleted = false): Comment => ({ id, user, comments, deleted, level: 0, time: 0, time_ago: '1 hour ago', content: `<i>${user} says hello</i>` });
const story: Story & { content: string } = { id: 123, title: 'A story', points: 42, user: 'author', time: 0, time_ago: 2, type: 'story', url: 'https://example.com/story', domain: 'example.com', comments: [comment(1, 'parent', [comment(2, 'child', [comment(3, 'grandchild')])]), comment(4, 'removed', [comment(5, 'hidden-child')], true)], comments_count: 4, poll: [], poll_votes_count: 0, deleted: false, dead: false, content: '<b>Story body</b>' };
beforeEach(() => { vi.resetAllMocks(); vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
function show() {
  return render(<MemoryRouter initialEntries={['/item/123']}><SettingsProvider><AppRoutes /></SettingsProvider></MemoryRouter>);
}
it('loads the route item and shows loading until the response arrives', () => {
  vi.mocked(fetchItemContent).mockReturnValue(new Promise(() => {}));
  show();
  expect(screen.getByText('Loading...')).toBeTruthy();
  expect(fetchItemContent).toHaveBeenCalledWith(123, expect.any(AbortSignal));
});
it('shows the Angular error message on failure', async () => {
  vi.mocked(fetchItemContent).mockRejectedValue(new Error('offline'));
  show();
  expect(await screen.findByText('Could not load item comments.')).toBeTruthy();
  expect(screen.queryByText('Loading...')).toBeNull();
});
it('renders story header, metadata, HTML and new-tab settings', async () => {
  localStorage.setItem('openLinkInNewTab', 'true');
  vi.mocked(fetchItemContent).mockResolvedValue(story);
  const { container } = show();
  await screen.findByText('Story body');
  expect(screen.getAllByText('A story')[0].getAttribute('href')).toBe(story.url);
  expect(screen.getAllByText('A story')[0].getAttribute('target')).toBe('_blank');
  expect(screen.getAllByText('A story')[0].getAttribute('rel')).toBe('noopener');
  expect(screen.getByText('(example.com)')).toBeTruthy();
  expect(screen.getByText('42 points by')).toBeTruthy();
  expect(screen.getByText('author').getAttribute('href')).toBe('/user/author');
  expect(screen.getByText('4 comments')).toBeTruthy();
  expect(container.querySelector('.subject b')?.textContent).toBe('Story body');
});
it('recurses and collapses the body and descendants without losing their state', async () => {
  vi.mocked(fetchItemContent).mockResolvedValue(story);
  show();
  await screen.findByText('grandchild says hello');
  const toggle = screen.getByRole('button', { name: 'Collapse comment by parent' });
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(screen.getByText('child says hello').closest('[hidden]')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Collapse comment by child' })).toBeNull();
  fireEvent.keyDown(toggle, { key: 'Enter' });
  expect(screen.getByText('grandchild says hello').closest('[hidden]')).toBeNull();
  expect(toggle.textContent).toBe('[-]');
});
it('shows deleted placeholders but not deleted content or descendants', async () => {
  vi.mocked(fetchItemContent).mockResolvedValue(story);
  show();
  expect(await screen.findByText('[deleted]')).toBeTruthy();
  expect(screen.queryByText('removed says hello')).toBeNull();
  expect(screen.queryByText('hidden-child says hello')).toBeNull();
});
it('renders poll HTML and proportional bars', async () => {
  vi.mocked(fetchItemContent).mockResolvedValue({ ...story, type: 'poll', poll: [{ content: '<b>Yes</b>', points: 3 }, { content: 'No', points: 1 }], poll_votes_count: 4 });
  const { container } = show();
  await screen.findByText('Yes');
  expect(container.querySelector('.pollContent b')?.textContent).toBe('Yes');
  expect(Array.from(container.querySelectorAll<HTMLElement>('.pollBar')).map(bar => bar.style.width)).toEqual(['75%', '25%']);
});
it('handles empty comments, text, and zero-vote polls with internal titles', async () => {
  const empty: typeof story = { ...story, url: '', content: '', comments: [], comments_count: 0, type: 'poll', poll: [{ content: 'Empty', points: 0 }] };
  vi.mocked(fetchItemContent).mockResolvedValue(empty);
  const { container } = show();
  await screen.findByText('Empty');
  expect(screen.getAllByText('A story')[0].getAttribute('href')).toBe('/item/123');
  expect(screen.getByText('discuss')).toBeTruthy();
  expect(container.querySelector<HTMLElement>('.pollBar')?.style.width).toBe('0%');
  expect(container.querySelector('.comment-list')?.children.length).toBe(0);
});
it('removes executable HTML while retaining normal comment markup', async () => {
  const unsafe: typeof story = { ...story, content: '<script>alert(1)</script><b onclick="alert(1)">Safe</b><a href="javascript:alert(1)">link</a>' };
  vi.mocked(fetchItemContent).mockResolvedValue(unsafe);
  const { container } = show();
  await screen.findByText('Safe');
  expect(container.querySelector('.subject script')).toBeNull();
  expect(screen.getByText('Safe').hasAttribute('onclick')).toBe(false);
  expect(screen.getByText('link').getAttribute('href')).toMatch(/^unsafe:/);
});
it('aborts a pending request when leaving the page', async () => {
  vi.mocked(fetchItemContent).mockReturnValue(new Promise(() => {}));
  const view = show();
  const signal = vi.mocked(fetchItemContent).mock.calls[0][1];
  view.unmount();
  await waitFor(() => expect(signal?.aborted).toBe(true));
});
