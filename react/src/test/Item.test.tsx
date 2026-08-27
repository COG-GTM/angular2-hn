import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Item } from '../components/Item';
import { SettingsProvider } from '../context/SettingsContext';
import type { Story } from '../types/models';

const item: Story = {
  id: 42, title: 'Example story', points: 10, user: 'alice', time: 0, time_ago: '2 hours ago',
  type: 'story', url: '', domain: '', comments: [], comments_count: 1, poll: [], poll_votes_count: 0, deleted: false, dead: false
};

describe('Item', () => {
  it('renders internal story links and comment count', () => {
    render(<BrowserRouter><SettingsProvider><Item item={item} /></SettingsProvider></BrowserRouter>);
    expect(screen.getByRole('link', { name: 'Example story' })).toHaveAttribute('href', '/item/42');
    expect(screen.getByText('1 comment')).toBeInTheDocument();
  });
});
