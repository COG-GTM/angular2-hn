import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { HN_API_BASE_URL } from './api/hn';
import { App } from './App';
import { routes } from './routes/routes';
import { mockFetch } from './test/fetchMock';
import { newsPage1 } from './test/fixtures/stories';

describe('App smoke test', () => {
  it('renders story titles fetched from /news?page=1', async () => {
    const fetchSpy = mockFetch({ [`${HN_API_BASE_URL}/news?page=1`]: newsPage1 });
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });

    render(<App router={router} />);

    for (const story of newsPage1) {
      expect(await screen.findByText(story.title)).toBeInTheDocument();
    }
    expect(router.state.location.pathname).toBe('/news');
    expect(fetchSpy).toHaveBeenCalledWith(`${HN_API_BASE_URL}/news?page=1`, expect.anything());
  });
});
