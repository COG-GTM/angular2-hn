import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Story } from '../../models/story';
import { SettingsProvider } from '../../context/SettingsContext';
import { ItemDetails } from './ItemDetails';

const fetchItemContent = vi.hoisted(() => vi.fn());
vi.mock('../../api/hackernews', () => ({ fetchItemContent }));

const story = {
  id: 42,
  title: 'A story',
  points: 12,
  user: 'alice',
  time: 0,
  time_ago: '2 hours ago',
  type: 'link',
  url: 'https://example.com/post',
  domain: 'example.com',
  comments: [
    {
      id: 7,
      level: 0,
      user: 'bob',
      time: 0,
      time_ago: '1 hour ago',
      content: '<p>nice</p>',
      deleted: false,
      comments: [],
    },
  ],
  comments_count: 1,
  poll: [],
  poll_votes_count: 0,
  deleted: false,
  dead: false,
  content: '<p>story body</p>',
} as unknown as Story;

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/item/42']}>
      <SettingsProvider>
        <Routes>
          <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe('ItemDetails', () => {
  beforeEach(() => {
    fetchItemContent.mockReset();
    vi.stubGlobal('scrollTo', () => {});
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  it('renders the story, its content and comments', async () => {
    fetchItemContent.mockResolvedValue(story);
    renderPage();

    expect(await screen.findAllByRole('link', { name: 'A story' })).toHaveLength(2);
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
    expect(screen.getByText('story body')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1 comment' })).toHaveAttribute('href', '/item/42');
    expect(screen.getByText('nice')).toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', async () => {
    fetchItemContent.mockRejectedValue(new Error('boom'));
    renderPage();

    expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
  });
});
