import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { sendPageview } from './analytics';

export function usePageviews(): void {
    const location = useLocation();

    useEffect(() => {
        sendPageview(`${location.pathname}${location.search}`);
    }, [location.pathname, location.search]);
}
