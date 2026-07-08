import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Feed from './Feed';
import { Story } from '../../models/story';
import { SettingsProvider } from '../../context/SettingsProvider';
import { fetchFeed } from '../../api/hackerNews';

jest.mock('../../api/hackerNews');

const mockedFetchFeed = fetchFeed as jest.MockedFunction<typeof fetchFeed>;

function makeStory(id: number): Story {
  return {
    id,
    title: `Story ${id}`,
    points: 10,
    user: `user${id}`,
    time: 0,
    time_ago: 0,
    type: 'story',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
  };
}

function makeStories(count: number): Story[] {
  return Array.from({ length: count }, (_, i) => makeStory(i));
}

function renderFeed(page: string) {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[`/news/${page}`]}>
        <Routes>
          <Route path="/news/:page" element={<Feed feedType="news" />} />
        </Routes>
      </MemoryRouter>
    </SettingsProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  mockedFetchFeed.mockReset();
});

describe('Feed', () => {
  it('renders the loader initially, then the items once the fetch resolves', async () => {
    mockedFetchFeed.mockResolvedValue(makeStories(3));
    renderFeed('1');

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    expect(await screen.findByText('Story 0')).toBeInTheDocument();
    expect(screen.getByText('Story 2')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders an error message when the fetch rejects', async () => {
    mockedFetchFeed.mockRejectedValue(new Error('network error'));
    renderFeed('1');

    expect(
      await screen.findByText('Could not load news stories.')
    ).toBeInTheDocument();
  });

  it('hides Prev and shows More on a full first page', async () => {
    mockedFetchFeed.mockResolvedValue(makeStories(30));
    renderFeed('1');

    await screen.findByText('Story 0');
    expect(screen.queryByText(/Prev/)).not.toBeInTheDocument();
    expect(screen.getByText(/More/)).toBeInTheDocument();
  });

  it('shows Prev and hides More on a later, partial page', async () => {
    mockedFetchFeed.mockResolvedValue(makeStories(10));
    renderFeed('2');

    await screen.findByText('Story 0');
    expect(screen.getByText(/Prev/)).toBeInTheDocument();
    expect(screen.queryByText(/More/)).not.toBeInTheDocument();
  });
});
