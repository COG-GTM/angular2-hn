import { useEffect, useState } from 'react';
import { fetchItem } from '../api/hn';
import type { Item } from '../api/types';

export type ItemState =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'success'; item: Item };

/** Loads an item with its comment tree; aborts on id change or unmount. `null` skips fetching. */
export function useItem(id: number | null): ItemState {
  const [result, setResult] = useState<{ id: number; state: ItemState } | null>(null);


  useEffect(() => {
    if (id === null) {
      return;
    }
    const controller = new AbortController();
    fetchItem(id, { signal: controller.signal }).then(
      (item) => setResult({ id, state: { status: 'success', item } }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ id, state: { status: 'error', error } });
        }
      },
    );
    return () => controller.abort();
  }, [id]);

  return result?.id === id ? result.state : { status: 'loading' };
}
