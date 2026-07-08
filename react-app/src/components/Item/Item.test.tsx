import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Item from './Item';
import { Story } from '../../models/story';
import { SettingsProvider } from '../../context/SettingsProvider';

function makeStory(id: number, overrides: Partial<Story> = {}): Story {
  return {
    id,
    title: `Story ${id}`,
    points: 10,
    user: `user${id}`,
    time: 0,
    time_ago: 0,
    type: 'story',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  };
}

function renderItem(story: Story) {
  return render(
    <SettingsProvider>
      <MemoryRouter>
        <Item item={story} />
      </MemoryRouter>
    </SettingsProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('Item', () => {
  it('renders an external link with new-tab attributes when openLinkInNewTab is set', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    const story = makeStory(1);

    renderItem(story);

    const titleLink = screen.getByRole('link', { name: 'Story 1' });
    expect(titleLink).toHaveAttribute('href', 'https://example.com/1');
    expect(titleLink).toHaveAttribute('target', '_blank');
    expect(titleLink).toHaveAttribute('rel', 'noopener');
  });

  it('renders an external link without new-tab attributes by default', () => {
    const story = makeStory(1);

    renderItem(story);

    const titleLink = screen.getByRole('link', { name: 'Story 1' });
    expect(titleLink).toHaveAttribute('href', 'https://example.com/1');
    expect(titleLink).not.toHaveAttribute('target');
    expect(titleLink).not.toHaveAttribute('rel');
  });

  it('links internally when the item has no external url (hasUrl is false)', () => {
    const story = makeStory(2, { url: 'item?id=2' });

    renderItem(story);

    const titleLink = screen.getByRole('link', { name: 'Story 2' });
    expect(titleLink).toHaveAttribute('href', '/item/2');
    expect(titleLink).not.toHaveAttribute('target');
  });
});
