import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router-dom';

import { makeComment, makePollResult, makeStory } from '../../test/fixtures';
import { mockFetch, renderApp, renderWithProviders } from '../../test/render';
import ItemDetailsPage from './ItemDetailsPage';

const API = 'https://node-hnapi.herokuapp.com';

function mockItem(item: object) {
  return mockFetch((url) => (url === `${API}/item/1` ? item : undefined));
}

describe('ItemDetailsPage', () => {
  it('shows the loader while the item is loading', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {}))
    );
    renderApp({ route: '/item/1' });
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('shows the Angular error message when the item fails to load', async () => {
    mockFetch(() => undefined);
    renderApp({ route: '/item/1' });
    expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders the item header, content and comment tree', async () => {
    const fetchFn = mockItem(
      makeStory({
        id: 1,
        title: 'A story about React',
        points: 42,
        user: 'alice',
        time_ago: '2 hours ago',
        domain: 'example.com',
        comments_count: 2,
        content: '<p>Story <i>body</i></p>',
        comments: [
          makeComment({ id: 10, comments: [makeComment({ id: 11, user: 'carol', content: '<p>Reply</p>' })] }),
        ],
      })
    );
    const { container } = renderApp({ route: '/item/1' });

    await screen.findByText('body');
    expect(fetchFn).toHaveBeenCalledWith(`${API}/item/1`, expect.anything());
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    const laptop = container.querySelector('.laptop')!;
    expect(laptop).toHaveClass('item-header');
    const title = laptop.querySelector('a.title')!;
    expect(title).toHaveTextContent('A story about React');
    expect(title).toHaveAttribute('href', 'https://example.com/react');
    expect(title).not.toHaveAttribute('target');
    expect(laptop.querySelector('.domain')).toHaveTextContent('(example.com)');
    expect(laptop.querySelector('.subtext')).toHaveTextContent('42 points by alice2 hours ago | 2 comments');
    expect(screen.getAllByRole('link', { name: 'alice' })[0]).toHaveAttribute('href', '/user/alice');
    expect(screen.getByRole('link', { name: '2 comments' })).toHaveAttribute('href', '/item/1');

    expect(container.querySelector('p.subject')!.innerHTML).toBe('<p>Story <i>body</i></p>');
    expect(container.querySelectorAll('.comment-list > li')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'carol' }).closest('.subtree')).not.toBeNull();
  });

  it('opens outbound title links in a new tab when the setting is on', async () => {
    mockItem(makeStory({ id: 1 }));
    const { container } = renderApp({ route: '/item/1', settings: { openLinkInNewTab: true } });
    await screen.findAllByText('A story about React');
    container.querySelectorAll('a.title').forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });
  });

  it('links self posts to the item route and omits the domain', async () => {
    mockItem(makeStory({ id: 1, url: 'item?id=1', domain: undefined, comments_count: 0 }));
    const { container } = renderApp({ route: '/item/1', settings: { openLinkInNewTab: true } });
    await screen.findAllByText('A story about React');
    const title = container.querySelector('.laptop a.title')!;
    expect(title).toHaveAttribute('href', '/item/1');
    expect(title).not.toHaveAttribute('target');
    expect(container.querySelector('.domain')).toBeNull();
    expect(container.querySelector('.laptop')).not.toHaveClass('item-header');
    expect(screen.getByRole('link', { name: 'discuss' })).toBeInTheDocument();
  });

  it('renders job postings without points, author or comment link', async () => {
    mockItem(makeStory({ id: 1, type: 'job', comments_count: 0, time_ago: '3 hours ago' }));
    const { container } = renderApp({ route: '/item/1' });
    await screen.findAllByText('A story about React');
    const laptop = container.querySelector('.laptop')!;
    expect(laptop).toHaveClass('item-header');
    expect(laptop.querySelector('.subtext')).toHaveTextContent(/^3 hours ago$/);
    expect(laptop.querySelector('.item-details')).toBeNull();
  });

  it('renders poll options with points and proportional bars', async () => {
    mockFetch((url) => {
      if (url === `${API}/item/1`) {
        return makeStory({ id: 1, type: 'poll', poll: [makePollResult(), makePollResult()] });
      }
      if (url === `${API}/item/2`) return makePollResult({ points: 30, content: '<p>Yes</p>' });
      if (url === `${API}/item/3`) return makePollResult({ points: 10, content: '<p>No</p>' });
      return undefined;
    });
    const { container } = renderApp({ route: '/item/1' });
    expect(await screen.findByText('30 points')).toBeInTheDocument();
    const options = container.querySelectorAll('.pollResults .pollContent');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Yes');
    expect(options[1]).toHaveTextContent('No10 points');
    expect(options[0].querySelector<HTMLElement>('.pollBar')!.style.width).toBe('75%');
    expect(options[1].querySelector<HTMLElement>('.pollBar')!.style.width).toBe('25%');
  });

  it('goes back in history from the back button', async () => {
    mockItem(makeStory({ id: 1 }));
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/start" element={<Link to="/item/1">open item</Link>} />
        <Route path="/item/:id" element={<ItemDetailsPage />} />
      </Routes>,
      { route: '/start' }
    );
    await user.click(screen.getByRole('link', { name: 'open item' }));
    await screen.findAllByText('A story about React');
    await user.click(container.querySelector('.mobile.item-header .back-button')!);
    expect(await screen.findByRole('link', { name: 'open item' })).toBeInTheDocument();
  });

  it('shows the error message for a non-numeric id', async () => {
    const fetchFn = mockFetch(() => undefined);
    renderApp({ route: '/item/abc' });
    expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    await waitFor(() => expect(fetchFn).not.toHaveBeenCalledWith(expect.stringContaining('/item/'), expect.anything()));
  });
});
