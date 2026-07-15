import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from './testUtils';

describe('ItemDetails', () => {
  it('renders the story title, content and comments', async () => {
    const { container } = renderApp({ route: '/item/1001' });
    await screen.findByText('Top level comment');
    // title renders in both the mobile and laptop sections
    expect(screen.getAllByText('News story 1').length).toBe(2);
    expect(container.querySelector('.subject')?.innerHTML).toContain('story <b>content</b>');
    expect(screen.getByText('Nested reply')).toBeInTheDocument();
  });

  it('shows a deleted comment placeholder', async () => {
    renderApp({ route: '/item/1001' });
    await screen.findByText('[deleted]');
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
  });

  it('renders poll results with points and bars', async () => {
    const { container } = renderApp({ route: '/item/300' });
    await screen.findAllByText('Poll: favorite framework?');
    const pollContents = container.querySelectorAll('.pollContent');
    expect(pollContents).toHaveLength(3);
    expect(within(pollContents[0] as HTMLElement).getByText('60 points')).toBeInTheDocument();
    const bar = pollContents[0].querySelector('.pollBar') as HTMLElement;
    // 60 / 120 * 100 = 50%
    expect(bar.style.width).toBe('50%');
  });

  it('renders an error message when the item fails to load', async () => {
    renderApp({ route: '/item/424242' });
    await screen.findByText('Could not load item comments.');
  });
});
