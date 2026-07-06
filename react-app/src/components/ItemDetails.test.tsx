import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import ItemDetails from './ItemDetails';
import { Story } from '../models/story';
import { renderWithProviders } from '../test/test-utils';
import * as hnApi from '../api/hnApi';

vi.mock('../api/hnApi');

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 100,
    title: 'Poll: best editor',
    points: 50,
    user: 'alice',
    time: 0,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com',
    domain: 'example.com',
    content: '<p>the body</p>',
    text: '',
    comments: [],
    comments_count: 2,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  };
}

describe('ItemDetails', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the item content and its comments', async () => {
    vi.mocked(hnApi.fetchItemContent).mockResolvedValue(
      makeStory({
        comments: [
          {
            id: 1,
            level: 0,
            user: 'bob',
            time: 0,
            time_ago: '1 hour ago',
            content: '<p>nice post</p>',
            deleted: false,
            comments: [],
          },
        ],
      })
    );
    renderWithProviders(<ItemDetails />, { route: '/item/100', path: '/item/:id' });

    await waitFor(() => expect(screen.getByText('the body')).toBeInTheDocument());
    expect(screen.getByText('nice post')).toBeInTheDocument();
    expect(hnApi.fetchItemContent).toHaveBeenCalledWith(100);
  });

  it('renders proportional poll bars', async () => {
    vi.mocked(hnApi.fetchItemContent).mockResolvedValue(
      makeStory({
        type: 'poll',
        poll_votes_count: 40,
        poll: [
          { points: 30, content: 'vim' },
          { points: 10, content: 'emacs' },
        ],
      })
    );
    const { container } = renderWithProviders(<ItemDetails />, {
      route: '/item/100',
      path: '/item/:id',
    });

    await waitFor(() => expect(screen.getByText('vim')).toBeInTheDocument());
    const bars = container.querySelectorAll('.pollBar');
    expect(bars).toHaveLength(2);
    expect((bars[0] as HTMLElement).style.width).toBe('75%');
    expect((bars[1] as HTMLElement).style.width).toBe('25%');
    expect(screen.getByText('30 points')).toBeInTheDocument();
  });

  it('renders an error message when the fetch fails', async () => {
    vi.mocked(hnApi.fetchItemContent).mockRejectedValue(new Error('boom'));
    renderWithProviders(<ItemDetails />, { route: '/item/100', path: '/item/:id' });

    await waitFor(() =>
      expect(screen.getByText('Could not load item comments.')).toBeInTheDocument()
    );
  });
});
