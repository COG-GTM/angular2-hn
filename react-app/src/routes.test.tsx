import { render, screen } from '@testing-library/react';
import { Link, createMemoryRouter, RouterProvider, useParams } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { routes } from './routes';
import { SettingsProvider } from './settings';
import { renderWithProviders } from './test/renderWithProviders';

vi.mock('./features/feeds/FeedPage', () => ({
  default: function FeedPage({ feedType }: { feedType: string }) {
    return <p>feed:{feedType}:{useParams().page}</p>;
  },
}));
vi.mock('./features/item-details/ItemDetailsPage', () => ({
  default: function ItemDetailsPage() {
    return <p>item:{useParams().id}</p>;
  },
}));
vi.mock('./features/user/UserPage', () => ({
  default: function UserPage() {
    return <p>user:{useParams().id}</p>;
  },
}));

function renderAt(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  );
  return router;
}

describe('routes', () => {
  it('redirects / to /news/1', async () => {
    const router = renderAt('/');
    expect(await screen.findByText('feed:news:1')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/news/1');
  });

  it.each(['news', 'newest', 'show', 'ask', 'jobs'])('maps /%s/:page to FeedPage', async (feedType) => {
    renderAt(`/${feedType}/3`);
    expect(await screen.findByText(`feed:${feedType}:3`)).toBeInTheDocument();
  });

  it('lazy-loads /item/:id and /user/:id', async () => {
    renderAt('/item/8863');
    expect(await screen.findByText('item:8863')).toBeInTheDocument();
    renderAt('/user/pg');
    expect(await screen.findByText('user:pg')).toBeInTheDocument();
  });

  it('renders the shell without a page for unknown URLs', () => {
    renderAt('/nope');
    expect(screen.getByTestId('app-root')).toBeInTheDocument();
    expect(screen.queryByText(/^feed:/)).not.toBeInTheDocument();
  });
});

describe('renderWithProviders', () => {
  it('mounts at a route pattern and exposes the current location', async () => {
    function Probe() {
      return <Link to="/user/pg">by {useParams().id}</Link>;
    }
    renderWithProviders(<Probe />, { route: '/item/1', path: '/item/:id' });
    expect(screen.getByTestId('location')).toHaveTextContent('/item/1');
    await userEvent.click(screen.getByText('by 1'));
    expect(screen.getByTestId('location')).toHaveTextContent('/user/pg');
  });
});
