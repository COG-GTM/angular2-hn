import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SettingsProvider } from '../../context/SettingsProvider';
import { BASE_URL } from '../../services/hackerNewsApi';
import { server } from '../../test/mocks/server';
import type { Story } from '../../types/story';
import { Feed } from './Feed';

function makeStories(count: number): Story[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Story ${i + 1}`,
    points: 10,
    user: 'alice',
    time: 0,
    time_ago: '1 hour ago',
    type: 'story',
    url: `https://example.com/${i + 1}`,
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
  })) as unknown as Story[];
}

function renderFeed(feedType: string, page: number) {
  return render(
    <MemoryRouter initialEntries={[`/${feedType}/${page}`]}>
      <SettingsProvider>
        <Routes>
          <Route path="/:feedType/:page" element={<Feed feedType={feedType} />} />
        </Routes>
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe('Feed', () => {
  it('renders 30 items with a More link and no Prev link on page 1', async () => {
    server.use(http.get(`${BASE_URL}/news`, () => HttpResponse.json(makeStories(30))));
    renderFeed('news', 1);

    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(30));
    expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/2');
    expect(screen.queryByRole('link', { name: /Prev/ })).not.toBeInTheDocument();
  });

  it('shows a Prev link and computes listStart on later pages', async () => {
    server.use(http.get(`${BASE_URL}/news`, () => HttpResponse.json(makeStories(30))));
    renderFeed('news', 2);

    const list = await screen.findByRole('list');
    expect(list).toHaveAttribute('start', '31');
    expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
    expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/3');
  });

  it('hides the More link when fewer than 30 items are returned', async () => {
    server.use(http.get(`${BASE_URL}/news`, () => HttpResponse.json(makeStories(10))));
    renderFeed('news', 1);

    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(10));
    expect(screen.queryByRole('link', { name: /More/ })).not.toBeInTheDocument();
  });

  it('renders the jobs header for the jobs feed', async () => {
    server.use(http.get(`${BASE_URL}/jobs`, () => HttpResponse.json(makeStories(3))));
    renderFeed('jobs', 1);

    expect(await screen.findByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
  });

  it('shows an error message when the request fails', async () => {
    server.use(http.get(`${BASE_URL}/news`, () => new HttpResponse(null, { status: 500 })));
    renderFeed('news', 1);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load news stories.');
  });

  it('scrolls to the top after loading', async () => {
    server.use(http.get(`${BASE_URL}/news`, () => HttpResponse.json(makeStories(5))));
    renderFeed('news', 1);

    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(0, 0));
  });
});
