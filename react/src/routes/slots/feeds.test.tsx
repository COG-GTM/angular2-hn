import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { HN_API_BASE_URL } from '../../api/hn';
import { mockFetch } from '../../test/fetchMock';
import { newsPage1 } from '../../test/fixtures/stories';
import { FeedSlot } from './feeds';

function renderAt(url: string) {
  const router = createMemoryRouter([{ path: '/news', element: <FeedSlot feed="news" /> }], {
    initialEntries: [url],
  });
  return render(<RouterProvider router={router} />);
}

describe('FeedSlot placeholder', () => {
  it('shows a loader, then titles for the requested ?page', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/news?page=2`]: newsPage1 });
    renderAt('/news?page=2');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText(newsPage1[0].title)).toBeInTheDocument();
  });

  it('defaults invalid pages to 1', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/news?page=1`]: newsPage1 });
    renderAt('/news?page=abc');
    expect(await screen.findByText(newsPage1[0].title)).toBeInTheDocument();
  });

  it('shows an error when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch({ [`${HN_API_BASE_URL}/news?page=1`]: { status: 500, body: {} } });
    renderAt('/news');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load stories.');
  });
});
