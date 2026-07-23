import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { BASE_URL } from '../../services/hackerNewsApi';
import { server } from '../../test/mocks/server';
import { UserProfile } from './UserProfile';

function renderUser(id: string, extraEntries: string[] = []) {
  return render(
    <MemoryRouter initialEntries={[...extraEntries, `/user/${id}`]} initialIndex={extraEntries.length}>
      <Routes>
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/news/:page" element={<div>news feed</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('UserProfile', () => {
  it('renders id, karma, created and about HTML', async () => {
    server.use(
      http.get(`${BASE_URL}/user/pg`, () =>
        HttpResponse.json({
          id: 'pg',
          karma: 155000,
          created: 'April 12, 2007',
          about: '<i>hacker</i>',
        })
      )
    );

    renderUser('pg');

    expect((await screen.findAllByText('pg')).length).toBeGreaterThan(0);
    expect(screen.getByText('155000 ★')).toBeInTheDocument();
    expect(screen.getByText(/Created April 12, 2007/)).toBeInTheDocument();
    expect(screen.getByText('hacker').tagName).toBe('I');
  });

  it('shows a loader before data resolves', () => {
    server.use(
      http.get(`${BASE_URL}/user/pg`, () => HttpResponse.json({ id: 'pg', karma: 1, created: 'x' }))
    );
    renderUser('pg');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows an error message when the request fails', async () => {
    server.use(http.get(`${BASE_URL}/user/ghost`, () => new HttpResponse(null, { status: 404 })));
    renderUser('ghost');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user ghost.');
  });

  it('navigates back when the back button is clicked', async () => {
    server.use(
      http.get(`${BASE_URL}/user/pg`, () => HttpResponse.json({ id: 'pg', karma: 1, created: 'x' }))
    );

    const { container } = renderUser('pg', ['/news/1']);
    await screen.findAllByText('pg');

    const backButton = container.querySelector('.back-button');
    expect(backButton).not.toBeNull();
    await userEvent.click(backButton as Element);

    expect(await screen.findByText('news feed')).toBeInTheDocument();
  });
});
