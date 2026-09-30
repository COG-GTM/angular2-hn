import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../App';
import { SettingsProvider } from '../../settings/SettingsProvider';
import { mockMatchMedia } from '../../test/matchMedia';
import { routerFuture } from '../../routes';

function renderApp(path = '/newest/1') {
  const router = createMemoryRouter(
    [{ path: '/', element: <App />, children: [{ path: '*', element: <main>page</main> }] }],
    { initialEntries: [path], future: routerFuture },
  );
  const view = render(
    <SettingsProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </SettingsProvider>,
  );
  return { router, ...view };
}

function openSettings(container: HTMLElement) {
  fireEvent.click(container.querySelector('.info img.settings')!);
  return container.querySelector<HTMLElement>('.app-settings .popup')!;
}

beforeEach(() => {
  localStorage.clear();
  mockMatchMedia(false);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('App shell', () => {
  it('renders the Angular root structure with the theme class', () => {
    localStorage.setItem('theme', 'night');
    const { container } = renderApp();
    const root = container.firstElementChild!;
    expect(root).toHaveClass('night');
    expect(root.children[0]).toHaveClass('body-cover');
    const wrapper = root.children[1];
    expect(wrapper).toHaveClass('wrapper');
    expect([...wrapper.children].map((el) => el.className || el.tagName)).toEqual(['app-header', 'MAIN', 'app-footer']);
  });

  it('switches the root theme class when a theme radio is selected', () => {
    const { container } = renderApp();
    expect(container.firstElementChild).toHaveClass('default');
    const popup = openSettings(container);
    fireEvent.click(within(popup).getByLabelText('Black (AMOLED)'));
    expect(container.firstElementChild).toHaveClass('amoledblack');
    expect(container.firstElementChild).not.toHaveClass('default');
  });
});

describe('Header', () => {
  it('renders the home link and feed links in Angular order', () => {
    const { container } = renderApp();
    const home = container.querySelector('#header > a.home-link')!;
    expect(home).toHaveAttribute('href', '/news/1');
    expect(home.querySelector('.logo-inner')).toBeInTheDocument();
    expect(home.querySelector('img.logo')).toHaveAttribute('src', 'assets/images/logo.svg');
    const nav = container.querySelector('.header-text .left .header-nav')!;
    expect(nav.textContent).toBe('new | show | ask | jobs');
    expect([...nav.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual([
      '/newest/1',
      '/show/1',
      '/ask/1',
      '/jobs/1',
    ]);
  });

  it('marks the link of the current route active', () => {
    const { container } = renderApp('/show/1');
    expect(screen.getByText('show')).toHaveClass('active');
    expect(screen.getByText('new')).not.toHaveClass('active');
    expect(container.querySelector('a.home-link')).not.toHaveClass('active');
  });

  it('navigates and scrolls to the top when a link is clicked', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    const { router, container } = renderApp('/news/1');
    expect(container.querySelector('a.home-link')).toHaveClass('active');
    fireEvent.click(screen.getByText('jobs'));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(router.state.location.pathname).toBe('/jobs/1');
    fireEvent.click(container.querySelector('a.home-link')!);
    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(router.state.location.pathname).toBe('/news/1');
  });

  it('toggles the settings popup with the cog', () => {
    const { container } = renderApp();
    const cog = container.querySelector('.info img.settings')!;
    expect(cog).toHaveAttribute('src', 'assets/images/cog.svg');
    expect(container.querySelector('.app-settings')).toBeNull();
    fireEvent.click(cog);
    expect(container.querySelector('header > .app-settings #popup1.overlay .popup')).toBeInTheDocument();
    fireEvent.click(cog);
    expect(container.querySelector('.app-settings')).toBeNull();
  });
});

describe('SettingsPanel', () => {
  it('closes with the close control', () => {
    const { container } = renderApp();
    const popup = openSettings(container);
    expect(within(popup).getByRole('heading', { level: 1 })).toHaveTextContent('Settings');
    fireEvent.click(popup.querySelector('.close')!);
    expect(container.querySelector('.app-settings')).toBeNull();
  });

  it('toggles and persists "Open links in a new tab"', () => {
    const { container } = renderApp();
    const popup = openSettings(container);
    const checkbox = popup.querySelector<HTMLInputElement>('input[type=checkbox]')!;
    expect(checkbox.parentElement).toHaveTextContent('Open links in a new tab');
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it('reflects and persists the selected theme', () => {
    localStorage.setItem('theme', 'night');
    const { container } = renderApp();
    const popup = openSettings(container);
    const radios = [...popup.querySelectorAll<HTMLInputElement>('input[type=radio]')];
    expect(radios.map((r) => [r.value, r.name, r.checked])).toEqual([
      ['default', 'theme', false],
      ['night', 'theme', true],
      ['amoledblack', 'theme', false],
    ]);
    fireEvent.click(within(popup).getByLabelText('Default'));
    expect(radios[0].checked).toBe(true);
    expect(localStorage.getItem('theme')).toBe('default');
    fireEvent.click(within(popup).getByLabelText('Night'));
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('shows saved font size / list spacing and persists them on keyup', () => {
    localStorage.setItem('titleFontSize', '18');
    const { container } = renderApp();
    const popup = openSettings(container);
    const font = within(popup).getByLabelText('Font size:') as HTMLInputElement;
    const spacing = within(popup).getByLabelText('List spacing:') as HTMLInputElement;
    expect(font).toHaveAttribute('min', '1');
    expect(spacing).toHaveAttribute('min', '0');
    expect(font.value).toBe('18');
    expect(spacing.value).toBe('0');

    fireEvent.change(font, { target: { value: '24' } });
    expect(localStorage.getItem('titleFontSize')).toBe('18');
    fireEvent.keyUp(font, { key: '4' });
    expect(localStorage.getItem('titleFontSize')).toBe('24');

    fireEvent.change(spacing, { target: { value: '7' } });
    fireEvent.keyUp(spacing, { key: '7' });
    expect(localStorage.getItem('listSpacing')).toBe('7');
  });

  it('keeps the edited values when reopened', () => {
    const { container } = renderApp();
    let popup = openSettings(container);
    const font = within(popup).getByLabelText('Font size:') as HTMLInputElement;
    fireEvent.change(font, { target: { value: '30' } });
    fireEvent.keyUp(font, { key: '0' });
    fireEvent.click(popup.querySelector('.close')!);
    popup = openSettings(container);
    expect((within(popup).getByLabelText('Font size:') as HTMLInputElement).value).toBe('30');
  });
});

describe('Footer', () => {
  it('renders the GitHub link', () => {
    const { container } = renderApp();
    const footer = container.querySelector('.app-footer #footer p')!;
    expect(footer).toHaveTextContent('Show this project some ❤ on GitHub');
    const link = within(footer as HTMLElement).getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
  });
});
