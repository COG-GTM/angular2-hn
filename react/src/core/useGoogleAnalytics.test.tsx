import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { useGoogleAnalytics } from './useGoogleAnalytics';

function AnalyticsHarness() {
    const navigate = useNavigate();

    useGoogleAnalytics();

    return <button onClick={() => navigate('/ask/1')}>Navigate</button>;
}

describe('useGoogleAnalytics', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        delete window.ga;
    });

    it('tracks the initial location and subsequent navigation', async () => {
        const ga = vi.fn();
        window.ga = ga;

        render(
            <MemoryRouter initialEntries={['/news/1?x=1']}>
                <AnalyticsHarness />
            </MemoryRouter>
        );

        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1?x=1');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');

        await userEvent.click(screen.getByRole('button', { name: 'Navigate' }));

        expect(ga).toHaveBeenCalledWith('set', 'page', '/ask/1');
    });

    it('does not throw when analytics is unavailable', () => {
        expect(() =>
            render(
                <MemoryRouter>
                    <AnalyticsHarness />
                </MemoryRouter>
            )
        ).not.toThrow();
    });
});
