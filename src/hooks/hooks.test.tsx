import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFeed } from './useFeed';
import { useItem } from './useItem';
import { useUser } from './useUser';
import { Story, User } from '../models';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Example',
        points: 10,
        user: 'alice',
        time: 0,
        time_ago: 0,
        type: 'story',
        url: 'https://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 0,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function jsonResponse(data: unknown) {
    return { json: () => Promise.resolve(data) };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('useFeed', () => {
    it('transitions from loading to data', async () => {
        const stories = [makeStory({ id: 1 })];
        fetchMock.mockResolvedValue(jsonResponse(stories));

        const { result } = renderHook(() => useFeed('news', 1));

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.stories).toEqual(stories);
        expect(result.current.error).toBeNull();
    });

    it('aborts the in-flight request on unmount', async () => {
        let capturedSignal: AbortSignal | undefined;
        fetchMock.mockImplementation((_url: string, opts?: RequestInit) => {
            capturedSignal = opts?.signal ?? undefined;
            return new Promise(() => {});
        });

        const { unmount } = renderHook(() => useFeed('news', 1));
        unmount();

        expect(capturedSignal?.aborted).toBe(true);
    });
});

describe('useItem', () => {
    it('transitions from loading to data', async () => {
        const item = makeStory({ id: 7 });
        fetchMock.mockResolvedValue(jsonResponse(item));

        const { result } = renderHook(() => useItem(7));

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.item).toEqual(item);
        expect(result.current.error).toBeNull();
    });
});

describe('useUser', () => {
    it('transitions from loading to data', async () => {
        const user: User = {
            id: 'alice',
            crated_time: 0,
            created: '2020',
            karma: 100,
            avg: 1,
            about: 'hi',
        };
        fetchMock.mockResolvedValue(jsonResponse(user));

        const { result } = renderHook(() => useUser('alice'));

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.user).toEqual(user);
    });

    it('transitions from loading to error', async () => {
        fetchMock.mockRejectedValue(new Error('boom'));

        const { result } = renderHook(() => useUser('alice'));

        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBeNull();
    });
});
