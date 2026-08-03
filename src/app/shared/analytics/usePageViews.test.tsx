import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePageViews } from './usePageViews';

function wrapperFor(route: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="*" element={children} />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => {
  delete window.ga;
});

describe('usePageViews', () => {
  it('reports the current page to Google Analytics', () => {
    const ga = vi.fn();
    window.ga = ga;

    renderHook(() => usePageViews(), { wrapper: wrapperFor('/item/1?ref=hn') });

    expect(ga).toHaveBeenCalledWith('set', 'page', '/item/1?ref=hn');
    expect(ga).toHaveBeenCalledWith('send', 'pageview');
  });

  it('reports again after a navigation', () => {
    const ga = vi.fn();
    window.ga = ga;

    const { result } = renderHook(
      () => {
        usePageViews();
        return useNavigate();
      },
      { wrapper: wrapperFor('/news/1') }
    );

    ga.mockClear();
    act(() => void result.current('/news/2'));

    expect(ga).toHaveBeenCalledWith('set', 'page', '/news/2');
  });

  it('does not report the redirecting root path', () => {
    const ga = vi.fn();
    window.ga = ga;

    renderHook(() => usePageViews(), { wrapper: wrapperFor('/') });

    expect(ga).not.toHaveBeenCalled();
  });

  it('is a no-op when analytics is unavailable', () => {
    expect(() => renderHook(() => usePageViews(), { wrapper: wrapperFor('/news/1') })).not.toThrow();
  });
});
