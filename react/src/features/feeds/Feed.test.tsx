import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed } from '../../api/hackernews';
import { SettingsProvider } from '../../context/SettingsContext';
import { Story } from '../../models/story';
import { Feed } from './Feed';

vi.mock('../../api/hackernews', () => ({
  fetchFeed: vi.fn(),
}));

const fetchFeedMock = vi.mocked(fetchFeed);

function makeStory(id: number): Story {
  return {
    id,
    title: `Story ${id}`,
    points: 10 + id,
    user: `user${id}`,
    time: 0,
    time_ago: '1 hour ago' as unknown as number,
    type: 'story',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments: [],
    comments_count: id,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
  };
}

function renderFeed(path: string) {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/news/:page" element={<Feed feedType="news" />} />
          <Route path="/news" element={<Feed feedType="news" />} />
        </Routes>
      </MemoryRouter>
    </SettingsProvider>
  );
}

describe('Feed', () => {
  beforeAll(() => {
    vi.stubGlobal('scrollTo', vi.fn());
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rows for a loaded feed', async () => {
    fetchFeedMock.mockResolvedValue([makeStory(1), makeStory(2)]);

    renderFeed('/news');

    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(screen.getByText('Story 2')).toBeInTheDocument();
    expect(fetchFeedMock).toHaveBeenCalledWith('news', 1, expect.anything());
    expect(screen.queryByRole('link', { name: /Prev/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /More/ })).not.toBeInTheDocument();
  });

  it('renders pagination links', async () => {
    fetchFeedMock.mockResolvedValue(
      Array.from({ length: 30 }, (_, index) => makeStory(index + 1))
    );

    renderFeed('/news/2');

    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
    expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/3');
  });

  it('shows an error message when the request fails', async () => {
    fetchFeedMock.mockRejectedValue(new Error('boom'));

    renderFeed('/news');

    expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
  });
});
