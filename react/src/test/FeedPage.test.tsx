import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedPage } from '../pages/FeedPage';
import { SettingsProvider } from '../context/SettingsContext';

describe('FeedPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      id: 1, title: 'Fetched story', points: 5, user: 'alice', time: 0, time_ago: 'now', type: 'story',
      url: '', domain: '', comments: [], comments_count: 0, poll: [], poll_votes_count: 0, deleted: false, dead: false
    }]), { status: 200, headers: { 'Content-Type': 'application/json' } })));
  });

  it('renders fetched items', async () => {
    render(<BrowserRouter><SettingsProvider><FeedPage feedType="news" /></SettingsProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('Fetched story')).toBeInTheDocument());
  });
});
