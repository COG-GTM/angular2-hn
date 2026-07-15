import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from './testUtils';

describe('Feed', () => {
  it('renders an ordered list of items starting at 1 on page 1', async () => {
    const { container } = renderApp({ route: '/news/1' });
    await screen.findByText('News story 1');
    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    expect(ol?.getAttribute('start')).toBe('1');
    expect(ol?.querySelectorAll('li.post')).toHaveLength(30);
  });

  it('shows a loader before data resolves', () => {
    const { container } = renderApp({ route: '/news/1' });
    expect(container.querySelector('.loader')).not.toBeNull();
  });

  it('shows "More ›" when there are 30 items and hides "‹ Prev" on page 1', async () => {
    renderApp({ route: '/news/1' });
    await screen.findByText('News story 1');
    expect(screen.getByText(/More/)).toBeInTheDocument();
    expect(screen.queryByText(/Prev/)).not.toBeInTheDocument();
  });

  it('shows "‹ Prev" and hides "More ›" on page 2 with fewer than 30 items', async () => {
    const { container } = renderApp({ route: '/news/2' });
    await screen.findByText('News story 31');
    const ol = container.querySelector('ol');
    expect(ol?.getAttribute('start')).toBe('31');
    expect(screen.getByText(/Prev/)).toBeInTheDocument();
    expect(screen.queryByText(/More/)).not.toBeInTheDocument();
  });

  it('renders the jobs header for the jobs feed', async () => {
    renderApp({ route: '/jobs/1' });
    await screen.findByText(/These are jobs at startups/);
    expect(screen.getByText(/Y Combinator/)).toBeInTheDocument();
  });

  it('renders an error message when the feed fails to load', async () => {
    renderApp({ route: '/news/999' });
    await screen.findByText('Could not load news stories.');
  });

  it('a job item hides points/user but shows the title', async () => {
    const { container } = renderApp({ route: '/jobs/1' });
    await screen.findByText('Senior Engineer at YC Startup (San Francisco)');
    const firstPost = container.querySelector('li.post');
    expect(within(firstPost as HTMLElement).queryByText('★', { exact: false })).toBeNull();
  });
});
