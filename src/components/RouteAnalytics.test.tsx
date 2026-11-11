import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { RouteAnalytics } from './RouteAnalytics';

afterEach(() => vi.unstubAllGlobals());

function Navigation() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/item/123?view=comments')}>Open comments</button>;
}

it('sends the initial page and client navigations with search, once in StrictMode', () => {
  const ga = vi.fn();
  vi.stubGlobal('ga', ga);
  render(<StrictMode><MemoryRouter initialEntries={['/news/1?sort=top']}><RouteAnalytics /><Navigation /></MemoryRouter></StrictMode>);
  expect(ga.mock.calls).toEqual([['set', 'page', '/news/1?sort=top'], ['send', 'pageview']]);
  fireEvent.click(screen.getByRole('button', { name: 'Open comments' }));
  expect(ga.mock.calls).toEqual([
    ['set', 'page', '/news/1?sort=top'], ['send', 'pageview'],
    ['set', 'page', '/item/123?view=comments'], ['send', 'pageview'],
  ]);
});

it.each([undefined, null, 'unavailable'])('does not crash when analytics is %s', ga => {
  vi.stubGlobal('ga', ga);
  render(<MemoryRouter><RouteAnalytics /><Navigation /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Open comments' }));
  expect(screen.getByRole('button', { name: 'Open comments' })).toBeTruthy();
});
