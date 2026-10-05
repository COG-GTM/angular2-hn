import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { createTestQueryClient, mockFetch } from '../test/render';
import { makeFeedPage, makeStory, makeUser } from '../test/fixtures';
import { useFeed, useItem, useUser } from './hooks';

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>;
}

describe('API hooks', () => {
  it('useFeed loads stories for a feed/page', async () => {
    mockFetch((url) => (url.includes('/newest?page=3') ? makeFeedPage(61) : undefined));
    const { result } = renderHook(() => useFeed('newest', 3), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].id).toBe(61);
  });

  it('useItem exposes errors', async () => {
    mockFetch(() => undefined);
    const { result } = renderHook(() => useItem(1), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('useItem loads an item', async () => {
    mockFetch(() => makeStory({ id: 7 }));
    const { result } = renderHook(() => useItem(7), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe(7));
  });

  it('useUser is disabled without an id', () => {
    const fetchMock = mockFetch(() => makeUser());
    const { result } = renderHook(() => useUser(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
