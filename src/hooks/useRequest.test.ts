import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRequest } from './useRequest';

describe('useRequest', () => {
    it('exposes the resolved data and calls the success callback', async () => {
        const onSuccess = vi.fn();

        const { result } = renderHook(() => useRequest(async () => 'value', 'failed', [], onSuccess));

        await waitFor(() => expect(result.current.data).toBe('value'));
        expect(result.current.error).toBe('');
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('exposes the error message when the request rejects', async () => {
        const { result } = renderHook(() => useRequest(() => Promise.reject(new Error('boom')), 'failed', []));

        await waitFor(() => expect(result.current.error).toBe('failed'));
        expect(result.current.data).toBeNull();
    });

    it('aborts the in-flight request on unmount and ignores its result', async () => {
        const onSuccess = vi.fn();
        let capturedSignal: AbortSignal | undefined;
        let resolveRequest: (value: string) => void = () => {};

        const request = (signal: AbortSignal) => {
            capturedSignal = signal;
            return new Promise<string>((resolve) => {
                resolveRequest = resolve;
            });
        };

        const { unmount } = renderHook(() => useRequest(request, 'failed', [], onSuccess));
        unmount();
        resolveRequest('late value');
        await Promise.resolve();

        expect(capturedSignal?.aborted).toBe(true);
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('ignores rejections that happen after the request was aborted', async () => {
        let rejectRequest: (reason: Error) => void = () => {};
        const request = () =>
            new Promise<string>((_resolve, reject) => {
                rejectRequest = reject;
            });

        const { result, unmount } = renderHook(() => useRequest(request, 'failed', []));
        unmount();
        rejectRequest(new Error('boom'));
        await Promise.resolve();

        expect(result.current.error).toBe('');
    });

    it('re-runs the request when a dependency changes', async () => {
        const request = vi.fn(async () => 'value');

        const { rerender } = renderHook(({ id }: { id: number }) => useRequest(request, 'failed', [id]), {
            initialProps: { id: 1 },
        });
        await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

        rerender({ id: 2 });

        await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    });
});
