import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SettingsProvider } from '../../settings/SettingsContext';
import { Header } from './Header';

function Location() {
  return <span data-testid="path">{useLocation().pathname}</span>;
}

function renderHeader(path = '/news/1') {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[path]}>
        <Header />
        <Routes>
          <Route path="*" element={<Location />} />
        </Routes>
      </MemoryRouter>
    </SettingsProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('scrollTo', vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

describe('Header', () => {
  it('renders the home link, logo and feed nav in Angular order', () => {
    const { container } = renderHeader();
    expect(container.querySelector('a.home-link')).toHaveAttribute('href', '/news/1');
    expect(container.querySelector('img.logo')).toHaveAttribute('src', '/assets/images/logo.svg');
    const links = [...container.querySelectorAll('.header-nav a')];
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['new', '/newest/1'],
      ['show', '/show/1'],
      ['ask', '/ask/1'],
      ['jobs', '/jobs/1'],
    ]);
    expect(container.querySelector('.header-nav')).toHaveTextContent('new | show | ask | jobs');
  });

  it('marks the current feed active and scrolls to top on nav clicks', async () => {
    const { container } = renderHeader('/show/1');
    expect(container.querySelector('.header-nav a.active')).toHaveTextContent('show');
    await userEvent.click(screen.getByText('ask'));
    expect(screen.getByTestId('path')).toHaveTextContent('/ask/1');
    expect(container.querySelector('.header-nav a.active')).toHaveTextContent('ask');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    await userEvent.click(container.querySelector('a.home-link')!);
    expect(screen.getByTestId('path')).toHaveTextContent('/news/1');
    expect(container.querySelector('.header-nav a.active')).toBeNull();
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });

  it('toggles the settings popup with the cog', async () => {
    const { container } = renderHeader();
    expect(container.querySelector('.popup')).toBeNull();
    await userEvent.click(screen.getByAltText('Settings'));
    expect(container.querySelector('.popup h1')).toHaveTextContent('Settings');
    await userEvent.click(screen.getByAltText('Settings'));
    expect(container.querySelector('.popup')).toBeNull();
  });
});
