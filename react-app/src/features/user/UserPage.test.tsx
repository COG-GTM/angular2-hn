import { fireEvent, screen } from '@testing-library/react';
import { Link, Route, Routes } from 'react-router-dom';

import { HN_USER_API_BASE_URL } from '../../api/client';
import { makeUser } from '../../test/fixtures';
import { mockFetch, renderApp, renderWithProviders } from '../../test/render';
import UserPage from './UserPage';

function renderUserPage(id: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/user/:id" element={<UserPage />} />
    </Routes>,
    { route: `/user/${id}` }
  );
}

describe('UserPage', () => {
  it('fetches the user from the HNPWA user endpoint', async () => {
    const fetchMock = mockFetch(() => makeUser({ id: 'pg' }));
    renderUserPage('pg');
    await screen.findByText('Profile: pg');
    expect(fetchMock).toHaveBeenCalledWith(`${HN_USER_API_BASE_URL}/user/pg.json`, expect.anything());
  });

  it('shows the loader while loading', () => {
    mockFetch(() => new Promise(() => {}));
    renderUserPage('pg');
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('renders the profile header, karma, created date and about HTML', async () => {
    mockFetch(() =>
      makeUser({ id: 'pg', karma: 157316, created: '19 years ago', about: 'Bug fixer.<p><a href="/x">link</a>' })
    );
    const { container } = renderUserPage('pg');

    expect(await screen.findByText('Profile: pg')).toHaveClass('title-block');
    expect(container.querySelector('.mobile.item-header .title-block .back-button')).toBeInTheDocument();
    expect(container.querySelector('.main-details .name')).toHaveTextContent(/^pg$/);
    expect(container.querySelector('.main-details .right')).toHaveTextContent('157316 ★');
    expect(container.querySelector('.main-details .age')).toHaveTextContent('Created 19 years ago');
    const about = container.querySelector('.other-details p')!;
    expect(about.innerHTML).toBe('Bug fixer.<p><a href="/x">link</a></p>');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('omits the about section when the user has no about text', async () => {
    mockFetch(() => makeUser({ id: 'pg', about: undefined }));
    const { container } = renderUserPage('pg');
    await screen.findByText('Profile: pg');
    expect(container.querySelector('.other-details')).not.toBeInTheDocument();
  });

  it('shows the Angular error message for an unknown user', async () => {
    mockFetch(() => undefined);
    renderUserPage('nobody');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user nobody.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the error message when the API returns null for an unknown user', async () => {
    mockFetch(() => null);
    renderUserPage('nobody');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user nobody.');
  });

  it('scrolls to the top on load', async () => {
    mockFetch(() => makeUser({ id: 'pg' }));
    renderUserPage('pg');
    await screen.findByText('Profile: pg');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('goes back when the back button is clicked', async () => {
    mockFetch(() => makeUser({ id: 'pg' }));
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/item/:id" element={<Link to="/user/pg">item page</Link>} />
        <Route path="/user/:id" element={<UserPage />} />
      </Routes>,
      { route: '/item/1' }
    );
    fireEvent.click(screen.getByText('item page'));
    await screen.findByText('Profile: pg');
    fireEvent.click(container.querySelector('.back-button')!);
    expect(await screen.findByText('item page')).toBeInTheDocument();
  });

  it('is rendered by the /user/:id route', async () => {
    mockFetch((url) => (url.includes('/user/') ? makeUser({ id: 'pg' }) : []));
    renderApp({ route: '/user/pg' });
    expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
  });
});
