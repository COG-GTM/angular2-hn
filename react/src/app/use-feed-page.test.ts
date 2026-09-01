import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useFeedPage } from './use-feed-page';

describe('useFeedPage', () => {
    it('returns 1 when the page parameter is missing', () => {
        const { result } = renderHook(() => useFeedPage(), {
            wrapper: MemoryRouter,
        });

        expect(result.current).toBe(1);
    });
});
