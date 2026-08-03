import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeStory, makeUser } from '../test/fixtures';
import { renderWithProviders } from '../test/renderWithProviders';
import { App } from './App';
import { fetchFeed, fetchItemContent, fetchUser } from './shared/services/hackernewsApi';

vi.mock('./shared/services/hackernewsApi');

const fetchFeedMock = vi.mocked(fetchFeed);
const fetchItemContentMock = vi.mocked(fetchItemContent);
const fetchUserMock = vi.mocked(fetchUser);

beforeEach(() => {
  fetchFeedMock.mockReset().mockResolvedValue([makeStory()]);
  fetchItemContentMock.mockReset().mockResolvedValue(makeStory({ content: '<p>Story body</p>' }));
  fetchUserMock.mockReset().mockResolvedValue(makeUser());
});

describe('App', () => {
  it('redirects the root path to the news feed', async () => {
    renderWithProviders(<App />, { route: '/' });

    await waitFor(() => expect(fetchFeedMock).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal)));
    expect(await screen.findByRole('link', { name: 'A React story' })).toBeInTheDocument();
  });

  it('renders the shell around every page', async () => {
    renderWithProviders(<App />, { route: '/news/1' });

    expect(screen.getByRole('link', { name: 'Logo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    await screen.findByRole('link', { name: 'A React story' });
  });

  it.each([
    ['/newest/1', 'newest'],
    ['/show/1', 'show'],
    ['/ask/1', 'ask'],
    ['/jobs/1', 'jobs'],
  ])('serves %s from the %s feed', async (route, feedType) => {
    renderWithProviders(<App />, { route });

    await waitFor(() => expect(fetchFeedMock).toHaveBeenCalledWith(feedType, 1, expect.any(AbortSignal)));
  });

  it('lazily renders item details', async () => {
    renderWithProviders(<App />, { route: '/item/8863' });

    expect(await screen.findByText('Story body')).toBeInTheDocument();
    expect(fetchItemContentMock).toHaveBeenCalledWith(8863, expect.any(AbortSignal));
  });

  it('lazily renders user profiles', async () => {
    renderWithProviders(<App />, { route: '/user/dan' });

    expect(await screen.findByText('Profile: dan')).toBeInTheDocument();
    expect(fetchUserMock).toHaveBeenCalledWith('dan', expect.any(AbortSignal));
  });

  it('navigates between feeds from the header', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/news/1' });

    await user.click(screen.getByRole('link', { name: 'ask' }));

    await waitFor(() => expect(fetchFeedMock).toHaveBeenCalledWith('ask', 1, expect.any(AbortSignal)));
  });

  it('applies the active theme to the app shell', async () => {
    localStorage.setItem('theme', 'amoledblack');
    const { container } = renderWithProviders(<App />, { route: '/news/1' });

    expect(container.querySelector('.app-view')).toHaveClass('amoledblack');
    await screen.findByRole('link', { name: 'A React story' });
  });
});
