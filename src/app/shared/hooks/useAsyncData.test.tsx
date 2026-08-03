import { renderHook, waitFor } from '@testing-library/react';
import { useCallback } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useAsyncData } from './useAsyncData';

describe('useAsyncData', () => {
  it('starts in the loading state', () => {
    const { result } = renderHook(() => useAsyncData('a', () => new Promise<string>(() => {})));

    expect(result.current).toEqual({ status: 'loading' });
  });

  it('exposes loaded data', async () => {
    const { result } = renderHook(() => useAsyncData('a', () => Promise.resolve('value')));

    await waitFor(() => expect(result.current).toEqual({ status: 'success', data: 'value' }));
  });

  it('reports failures', async () => {
    const { result } = renderHook(() => useAsyncData('a', () => Promise.reject(new Error('nope'))));

    await waitFor(() => expect(result.current).toEqual({ status: 'error' }));
  });

  it('returns to loading as soon as the key changes', async () => {
    const load = vi.fn((key: string) => Promise.resolve(key));
    const { result, rerender } = renderHook(
      ({ key }) => useAsyncData(key, useCallback(() => load(key), [key])),
      { initialProps: { key: 'a' } }
    );

    await waitFor(() => expect(result.current).toEqual({ status: 'success', data: 'a' }));

    rerender({ key: 'b' });
    expect(result.current).toEqual({ status: 'loading' });

    await waitFor(() => expect(result.current).toEqual({ status: 'success', data: 'b' }));
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('aborts the in-flight request on unmount', () => {
    const load = vi.fn((signal: AbortSignal) => new Promise<string>(() => void signal));
    const { unmount } = renderHook(() => useAsyncData('a', load));

    const signal = load.mock.calls[0][0];
    expect(signal.aborted).toBe(false);

    unmount();
    expect(signal.aborted).toBe(true);
  });

  it('ignores a response that resolves after the request was aborted', async () => {
    const resolvers: ((value: string) => void)[] = [];
    const load = vi.fn(() => new Promise<string>((resolve) => resolvers.push(resolve)));
    const { result, rerender } = renderHook(({ key }) => useAsyncData(key, load), { initialProps: { key: 'a' } });

    rerender({ key: 'b' });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));

    resolvers[0]('stale');
    await Promise.resolve();

    expect(result.current).toEqual({ status: 'loading' });
  });
});
