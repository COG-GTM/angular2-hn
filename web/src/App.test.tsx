import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import { stubMatchMedia } from './testUtils/matchMedia';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('App', () => {
    it('wraps its children in the themed shell', () => {
        stubMatchMedia(false);

        const { container } = render(
            <SettingsProvider>
                <App>
                    <p>content</p>
                </App>
            </SettingsProvider>
        );

        expect(container.querySelector('.default .body-cover')).not.toBeNull();
        expect(screen.getByText('content').parentElement).toHaveClass('wrapper');
    });

    it('applies the theme coming from the settings', () => {
        localStorage.setItem('theme', 'amoledblack');
        stubMatchMedia(false);

        const { container } = render(
            <SettingsProvider>
                <App />
            </SettingsProvider>
        );

        expect(container.querySelector('.amoledblack')).not.toBeNull();
    });
});
