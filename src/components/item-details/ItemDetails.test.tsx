import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SettingsProvider } from '../../context/SettingsProvider';
import { BASE_URL } from '../../services/hackerNewsApi';
import { server } from '../../test/mocks/server';
import { ItemDetails } from './ItemDetails';

function renderItem(id: number, extraEntries: string[] = []) {
  return render(
    <MemoryRouter initialEntries={[...extraEntries, `/item/${id}`]} initialIndex={extraEntries.length}>
      <SettingsProvider>
        <Routes>
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/news/:page" element={<div>news feed</div>} />
        </Routes>
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe('ItemDetails', () => {
  it('renders title, subtext and comments', async () => {
    server.use(
      http.get(`${BASE_URL}/item/5`, () =>
        HttpResponse.json({
          id: 5,
          type: 'story',
          title: 'A story title',
          url: 'https://example.com',
          domain: 'example.com',
          points: 99,
          user: 'alice',
          time_ago: '1 hour ago',
          comments_count: 1,
          content: '<p>body text</p>',
          comments: [
            { id: 6, level: 0, user: 'bob', time_ago: '30 min ago', content: 'nice', deleted: false, comments: [] },
          ],
        })
      )
    );

    renderItem(5);

    expect((await screen.findAllByText('A story title')).length).toBeGreaterThan(0);
    expect(screen.getByText('body text')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'bob' })).toBeInTheDocument();
    expect(screen.getByText('nice')).toBeInTheDocument();
  });

  it('renders poll bars proportional to points / poll_votes_count', async () => {
    server.use(
      http.get(`${BASE_URL}/item/100`, () =>
        HttpResponse.json({
          id: 100,
          type: 'poll',
          title: 'Best?',
          url: '',
          comments_count: 0,
          comments: [],
          poll: [
            { points: 0, content: 'A' },
            { points: 0, content: 'B' },
          ],
        })
      ),
      http.get(`${BASE_URL}/item/101`, () => HttpResponse.json({ points: 5, content: 'A' })),
      http.get(`${BASE_URL}/item/102`, () => HttpResponse.json({ points: 10, content: 'B' }))
    );

    const { container } = renderItem(100);

    await screen.findAllByText('Best?');
    await waitFor(() => expect(container.querySelectorAll('.pollBar')).toHaveLength(2));
    const bars = container.querySelectorAll<HTMLElement>('.pollBar');
    expect(bars[0].style.width).toBe(`${(5 / 15) * 100}%`);
    expect(bars[1].style.width).toBe(`${(10 / 15) * 100}%`);
  });

  it('shows an error message when loading fails', async () => {
    server.use(http.get(`${BASE_URL}/item/7`, () => new HttpResponse(null, { status: 500 })));
    renderItem(7);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
  });

  it('navigates back when the back button is clicked', async () => {
    server.use(
      http.get(`${BASE_URL}/item/5`, () =>
        HttpResponse.json({ id: 5, type: 'story', title: 'A story title', url: '', comments_count: 0, comments: [] })
      )
    );

    const { container } = renderItem(5, ['/news/1']);
    await screen.findAllByText('A story title');

    const backButton = container.querySelector('.back-button');
    expect(backButton).not.toBeNull();
    await userEvent.click(backButton as Element);

    expect(await screen.findByText('news feed')).toBeInTheDocument();
  });
});
