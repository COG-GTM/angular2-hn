import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { expect, it, vi } from 'vitest';
import { AppRoutes } from './routes';
import { SettingsProvider } from './settings';

vi.mock('./pages/FeedPage', () => ({ FeedPage: ({ feedType }: { feedType: string }) => <h2>Feed: {feedType}, page: {useLocation().pathname.split('/')[2]}</h2> }));

function Location() { return <output data-testid="location">{useLocation().pathname}</output>; }
it.each([
  ['/', 'Feed: news, page: 1', '/news/1'],
  ['/news/2', 'Feed: news, page: 2', '/news/2'],
  ['/newest/3', 'Feed: newest, page: 3', '/newest/3'],
  ['/show/4', 'Feed: show, page: 4', '/show/4'],
  ['/ask/5', 'Feed: ask, page: 5', '/ask/5'],
  ['/jobs/6', 'Feed: jobs, page: 6', '/jobs/6'],
  ['/item/123', 'Item: 123', '/item/123'],
  ['/user/alice', 'User: alice', '/user/alice'],
])('renders %s', (path, heading, destination) => {
  render(<MemoryRouter initialEntries={[path]}><SettingsProvider><AppRoutes /><Location /></SettingsProvider></MemoryRouter>);
  expect(screen.getByRole('heading', { name: heading })).toBeTruthy();
  expect(screen.getByTestId('location').textContent).toBe(destination);
});
