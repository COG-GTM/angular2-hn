import { render, screen } from '@testing-library/react';
import { Component, Suspense, type ReactNode } from 'react';
import { lazyWithReload } from './lazyWithReload';

const reload = vi.fn();

beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal('location', { ...window.location, reload });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  reload.mockReset();
});

it('reloads once when a chunk fails, then clears the flag after a successful load', async () => {
  const Broken = lazyWithReload(() => Promise.reject(new Error('chunk 404')));
  render(<Suspense fallback="loading"><Broken /></Suspense>);
  await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  expect(Number(sessionStorage.getItem('chunkReloadedAt'))).toBeGreaterThan(0);

  const Ok = lazyWithReload(async () => ({ default: () => <p>loaded</p> }));
  render(<Suspense fallback="loading"><Ok /></Suspense>);
  expect(await screen.findByText('loaded')).toBeInTheDocument();
  expect(sessionStorage.getItem('chunkReloadedAt')).toBeNull();
});

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <p>failed</p> : this.props.children;
  }
}

it('reloads again for a failure long after an earlier reload', async () => {
  sessionStorage.setItem('chunkReloadedAt', String(Date.now() - 60_000));
  const Broken = lazyWithReload(() => Promise.reject(new Error('chunk 404')));
  render(<Suspense fallback="loading"><Broken /></Suspense>);
  await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
});

it('rethrows instead of reloading again when the chunk still fails right after a reload', async () => {
  sessionStorage.setItem('chunkReloadedAt', String(Date.now()));
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const Broken = lazyWithReload(() => Promise.reject(new Error('chunk 404')));
  render(<Boundary><Suspense fallback="loading"><Broken /></Suspense></Boundary>);
  expect(await screen.findByText('failed')).toBeInTheDocument();
  expect(reload).not.toHaveBeenCalled();
});
