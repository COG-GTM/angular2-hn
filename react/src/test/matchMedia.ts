import { vi } from 'vitest';

type ChangeListener = (event: MediaQueryListEvent) => void;

export interface MatchMediaMock {
    setMatches: (matches: boolean) => void;
    dispatchChange: (matches: boolean) => void;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
}

export function mockMatchMedia(initialMatches = false): MatchMediaMock {
    let matches = initialMatches;
    const listeners = new Set<ChangeListener>();
    const addEventListener = vi.fn((_: string, listener: ChangeListener) => listeners.add(listener));
    const removeEventListener = vi.fn((_: string, listener: ChangeListener) => listeners.delete(listener));

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        get matches() {
            return matches;
        },
        media: query,
        onchange: null,
        addEventListener,
        removeEventListener,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));

    return {
        setMatches: (value) => {
            matches = value;
        },
        dispatchChange: (value) => {
            matches = value;
            listeners.forEach((listener) => listener({ matches: value } as MediaQueryListEvent));
        },
        addEventListener,
        removeEventListener,
    };
}
