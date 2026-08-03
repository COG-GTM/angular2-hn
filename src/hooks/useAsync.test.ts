import { renderHook, waitFor } from '@testing-library/react';

import { useAsync } from './useAsync';

describe('useAsync', () => {
    it('starts empty and exposes the resolved data', async () => {
        const { result } = renderHook(() => useAsync(() => Promise.resolve('hello'), [], 'boom'));

        expect(result.current).toEqual({ data: undefined, errorMessage: '' });
        await waitFor(() => expect(result.current.data).toBe('hello'));
    });

    it('reports the given error message on failure', async () => {
        const { result } = renderHook(() => useAsync(() => Promise.reject(new Error('nope')), [], 'boom'));

        await waitFor(() => expect(result.current.errorMessage).toBe('boom'));
        expect(result.current.data).toBeUndefined();
    });

    it('re-runs the task when dependencies change and keeps previous data meanwhile', async () => {
        const task = vi.fn((id: number) => Promise.resolve(`item ${id}`));
        const { result, rerender } = renderHook(({ id }) => useAsync(() => task(id), [id], 'boom'), {
            initialProps: { id: 1 },
        });

        await waitFor(() => expect(result.current.data).toBe('item 1'));

        rerender({ id: 2 });
        expect(result.current.data).toBe('item 1');

        await waitFor(() => expect(result.current.data).toBe('item 2'));
        expect(task).toHaveBeenCalledTimes(2);
    });

    it('clears a previous error once a later request succeeds', async () => {
        let shouldFail = true;
        const { result, rerender } = renderHook(
            ({ id }) => useAsync(() => (shouldFail ? Promise.reject(new Error('nope')) : Promise.resolve(id)), [id], 'boom'),
            { initialProps: { id: 1 } }
        );

        await waitFor(() => expect(result.current.errorMessage).toBe('boom'));

        shouldFail = false;
        rerender({ id: 2 });

        await waitFor(() => expect(result.current.errorMessage).toBe(''));
        expect(result.current.data).toBe(2);
    });

    it('aborts the in-flight request when dependencies change', async () => {
        const signals: AbortSignal[] = [];
        const { rerender } = renderHook(
            ({ id }) =>
                useAsync(
                    (signal) => {
                        signals.push(signal);
                        return new Promise<number>(() => {});
                    },
                    [id],
                    'boom'
                ),
            { initialProps: { id: 1 } }
        );

        rerender({ id: 2 });

        expect(signals[0].aborted).toBe(true);
        expect(signals[1].aborted).toBe(false);
    });

    it('ignores results that resolve after the request was aborted', async () => {
        let resolveTask: (value: string) => void = () => {};
        const { result, unmount } = renderHook(() =>
            useAsync(
                () =>
                    new Promise<string>((resolve) => {
                        resolveTask = resolve;
                    }),
                [],
                'boom'
            )
        );

        unmount();
        resolveTask('late');

        await Promise.resolve();
        expect(result.current.data).toBeUndefined();
    });
});
