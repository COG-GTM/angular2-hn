import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Story } from '../api/types';
import { SettingsProvider, useSettings } from '../hooks/useSettings';
import type { SettingsContextValue } from '../types/settings';
import { newsPage1 } from '../test/fixtures/stories';
import { StoryItem } from './StoryItem';

const [link, ask, job] = newsPage1;

function renderStory(story: Story) {
  const handle: { current?: SettingsContextValue } = {};
  function Capture() {
    handle.current = useSettings();
    return null;
  }
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <>
            <Capture />
            <StoryItem story={story} />
          </>
        ),
      },
    ],
    { initialEntries: ['/'] },
  );
  const view = render(
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>,
  );
  return { ...view, settings: () => handle.current! };
}

describe('StoryItem', () => {
  it('renders an external link story with domain, points, user, age and comments', () => {
    renderStory(link);
    const title = screen.getByRole('link', { name: link.title });
    expect(title).toHaveAttribute('href', link.url);
    expect(title).not.toHaveAttribute('target');
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
    expect(screen.getByText(/312 points by/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'alice' })[0]).toHaveAttribute('href', '/user/alice');
    expect(screen.getAllByText(/3 hours ago/).length).toBeGreaterThan(0);
    for (const el of screen.getAllByRole('link', { name: /87 comments/ })) {
      expect(el).toHaveAttribute('href', `/item/${link.id}`);
    }
  });

  it('links self posts (relative url) to the item page', () => {
    renderStory(ask);
    expect(screen.getByRole('link', { name: ask.title })).toHaveAttribute('href', `/item/${ask.id}`);
    expect(screen.queryByText(/\(.*\)/)).not.toBeInTheDocument();
  });

  it.each([
    [0, 'discuss'],
    [1, '1 comment'],
    [2, '2 comments'],
  ])('labels %i comments as "%s"', (count, label) => {
    renderStory({ ...link, comments_count: count });
    expect(screen.getAllByRole('link', { name: new RegExp(label) })).toHaveLength(2);
  });

  it('hides points, user and comments for jobs', () => {
    renderStory(job);
    expect(screen.getByRole('link', { name: job.title })).toHaveAttribute('href', job.url);
    expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /discuss|comment/ })).not.toBeInTheDocument();
    expect(screen.getAllByText('1 hour ago')).toHaveLength(2);
  });

  it('applies title font size, list spacing and open-in-new-tab settings', () => {
    const { settings, container } = renderStory(link);
    act(() => {
      settings().setFont('22');
      settings().setSpacing('12');
      settings().toggleOpenLinksInNewTab();
    });
    const title = screen.getByRole('link', { name: link.title });
    expect(title).toHaveStyle({ fontSize: '22px' });
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
    expect(container.querySelector('.story-item')).toHaveStyle({ marginBottom: '12px' });
  });
});
