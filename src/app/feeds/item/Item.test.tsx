import { screen } from '@testing-library/react';

import { makeStory } from '../../../test/fixtures';
import { renderWithProviders } from '../../../test/utils';
import { Item } from './Item';

describe('Item', () => {
  it('links external stories to their url and shows the domain', () => {
    renderWithProviders(<Item item={makeStory({ comments_count: 1 })} />);

    const title = screen.getByRole('link', { name: 'A story' });
    expect(title).toHaveAttribute('href', 'https://example.com/story');
    expect(title).not.toHaveAttribute('target');
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '1 comment' })[0]).toHaveAttribute('href', '/item/1');
    expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
  });

  it('links internal stories to the item page', () => {
    renderWithProviders(<Item item={makeStory({ id: 5, url: 'item?id=5', domain: undefined })} />);
    expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/5');
  });

  it('opens links in a new tab and applies typography settings', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '24');
    localStorage.setItem('listSpacing', '12');

    renderWithProviders(<Item item={makeStory()} />);

    const title = screen.getByRole('link', { name: 'A story' });
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
    expect(title).toHaveStyle({ fontSize: '24px' });
    expect(title.closest('p')?.parentElement).toHaveStyle({ marginBottom: '12px' });
  });

  it('hides author, points and comments for jobs', () => {
    renderWithProviders(<Item item={makeStory({ type: 'job' })} />);

    expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
    expect(screen.queryByText(/comments/)).not.toBeInTheDocument();
  });
});
