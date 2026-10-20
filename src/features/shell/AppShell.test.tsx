import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { AppShell } from './AppShell';

describe('AppShell', () => {
    it('renders .body-cover and .wrapper > header, outlet, footer (app.component.html)', () => {
        const { container } = renderWithProviders(
            <Routes>
                <Route element={<AppShell />}>
                    <Route path="/news/:page" element={<p data-testid="page">feed</p>} />
                </Route>
            </Routes>,
            { route: '/news/1' }
        );
        expect(container.querySelector('.body-cover')).toBeInTheDocument();
        const wrapper = container.querySelector('.wrapper');
        expect(wrapper?.children).toHaveLength(3);
        expect(wrapper?.children[0]).toHaveAttribute('data-testid', 'header');
        expect(wrapper?.children[1]).toBe(screen.getByTestId('page'));
        expect(wrapper?.children[2]).toHaveAttribute('data-testid', 'footer');
    });

    it('does not add its own theme wrapper; the theme class lives on <html>', () => {
        localStorage.setItem('theme', 'amoledblack');
        const { container } = renderWithProviders(<AppShell />);
        expect(document.documentElement).toHaveClass('amoledblack');
        expect(container.querySelector('.amoledblack')).toBeNull();
        expect(container.firstElementChild).toHaveClass('body-cover');
    });
});
