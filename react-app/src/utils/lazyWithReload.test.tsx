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
  expect(sessionStorage.getItem('chunkReloaded')).toBe('1');

  const Ok = lazyWithReload(async () => ({ default: () => <p>loaded</p> }));
  render(<Suspense fallback="loading"><Ok /></Suspense>);
  expect(await screen.findByText('loaded')).toBeInTheDocument();
  expect(sessionStorage.getItem('chunkReloaded')).toBeNull();
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

it('rethrows instead of reloading again when the chunk still fails after a reload', async () => {
  sessionStorage.setItem('chunkReloaded', '1');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const Broken = lazyWithReload(() => Promise.reject(new Error('chunk 404')));
  render(<Boundary><Suspense fallback="loading"><Broken /></Suspense></Boundary>);
  expect(await screen.findByText('failed')).toBeInTheDocument();
  expect(reload).not.toHaveBeenCalled();
});
