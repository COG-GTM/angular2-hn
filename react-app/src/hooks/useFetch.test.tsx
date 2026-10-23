import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { deferred } from '../test';
import { useFetch } from './useFetch';

describe('useFetch', () => {
    it('loads, resolves, and resets to loading on key change while aborting the old request', async () => {
        const first = deferred<string>();
        const second = deferred<string>();
        const signals: AbortSignal[] = [];
        const { result, rerender } = renderHook(
            ({ k }) =>
                useFetch((signal) => {
                    signals.push(signal);
                    return k === 'a' ? first.promise : second.promise;
                }, k),
            { initialProps: { k: 'a' } }
        );
        expect(result.current.status).toBe('loading');
        await act(async () => first.resolve('A'));
        expect(result.current).toMatchObject({ status: 'success', data: 'A' });

        rerender({ k: 'b' });
        expect(result.current.status).toBe('loading');
        expect(signals[0].aborted).toBe(true);
        await act(async () => second.reject(new Error('x')));
        expect(result.current.status).toBe('error');
    });
});
