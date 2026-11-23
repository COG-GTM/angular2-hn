import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: boolean;
}

/** Runs `load` whenever `deps` change, aborting the previous request. */
export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: false });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: false });
    load(controller.signal).then(
      (data) => !controller.signal.aborted && setState({ data, error: false }),
      () => !controller.signal.aborted && setState({ data: null, error: true })
    );
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
