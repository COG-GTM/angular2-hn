import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it, vi } from 'vitest';
import { App } from './App';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Settings } from './components/Settings/Settings';
import { SettingsProvider, useSettings } from './settings';

function CurrentSettings() {
  const { settings } = useSettings();
  return <output data-testid="settings">{JSON.stringify(settings)}</output>;
}
function mount(element: React.ReactNode, path = '/news/1') {
  return render(<MemoryRouter initialEntries={[path]}><SettingsProvider>{element}</SettingsProvider></MemoryRouter>);
}

it.each([['/news/1', 'Logo'], ['/newest/1', 'new'], ['/show/1', 'show'], ['/ask/1', 'ask'], ['/jobs/1', 'jobs']])('highlights the exact active route %s', (path, name) => {
  mount(<Header />, path);
  expect(screen.getByRole('link', { name }).classList.contains('active')).toBe(true);
  expect(document.querySelectorAll('a.active')).toHaveLength(1);
  for (const [label, href] of [['Logo', '/news/1'], ['new', '/newest/1'], ['show', '/show/1'], ['ask', '/ask/1'], ['jobs', '/jobs/1']]) {
    expect(screen.getByRole('link', { name: label }).getAttribute('href')).toBe(href);
  }
});
it('does not highlight page one on other pages and scrolls on navigation', () => {
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  mount(<Header />, '/news/2');
  expect(document.querySelectorAll('a.active')).toHaveLength(0);
  fireEvent.click(screen.getByRole('link', { name: 'ask' }));
  expect(scroll).toHaveBeenCalledWith(0, 0);
  expect(screen.getByRole('link', { name: 'ask' }).classList.contains('active')).toBe(true);
});
it('renders the original footer credit and safe external link', () => {
  render(<Footer />);
  expect(screen.getByText(/Show this project some ❤ on/)).toBeTruthy();
  const link = screen.getByRole('link', { name: 'GitHub' });
  expect(link.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
  expect(link.getAttribute('target')).toBe('_blank');
  expect(link.getAttribute('rel')).toBe('noopener');
});
it('updates every settings control, including empty numeric values', () => {
  mount(<><Settings /><CurrentSettings /></>);
  const state = () => JSON.parse(screen.getByTestId('settings').textContent!);
  fireEvent.click(screen.getByRole('checkbox'));
  expect(state().openLinkInNewTab).toBe(true);
  fireEvent.click(screen.getByRole('checkbox'));
  expect(state().openLinkInNewTab).toBe(false);
  for (const [name, theme] of [['Night', 'night'], ['Black (AMOLED)', 'amoled'], ['Default', 'default']]) {
    fireEvent.click(screen.getByRole('radio', { name }));
    expect(state().theme).toBe(theme);
    expect((screen.getByRole('radio', { name }) as HTMLInputElement).checked).toBe(true);
  }
  for (const [label, key, value] of [['Font size:', 'titleFontSize', '22'], ['List spacing:', 'listSpacing', '8']]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
    expect(state()[key]).toBe(value);
    fireEvent.change(screen.getByLabelText(label), { target: { value: '' } });
    expect(state()[key]).toBe('');
  }
});
it('toggles settings from the header and close control and applies all themes', () => {
  const { container } = mount(<App />);
  expect(container.firstElementChild?.className).toBe('default');
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
  expect(screen.getByRole('dialog')).toBeTruthy();
  for (const [name, theme] of [['Night', 'night'], ['Black (AMOLED)', 'amoledblack'], ['Default', 'default']]) {
    fireEvent.click(screen.getByRole('radio', { name }));
    expect(container.firstElementChild?.className).toBe(theme);
  }
  fireEvent.click(screen.getByRole('button', { name: 'Close settings' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.keyDown(screen.getByRole('button', { name: 'Settings' }), { key: 'Enter' });
  fireEvent.keyDown(screen.getByRole('button', { name: 'Close settings' }), { key: ' ' });
  expect(screen.queryByRole('dialog')).toBeNull();
});
