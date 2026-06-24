import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import App from '../App';

describe('Scaffold', () => {
    it('renders placeholder App without crashing', () => {
        const { container } = render(
            <SettingsProvider>
                <MemoryRouter>
                    <App />
                </MemoryRouter>
            </SettingsProvider>
        );
        expect(container.firstChild).toBeTruthy();
    });

    it('SettingsProvider provides context', () => {
        expect(() =>
            render(
                <SettingsProvider>
                    <MemoryRouter>
                        <App />
                    </MemoryRouter>
                </SettingsProvider>
            )
        ).not.toThrow();
    });
});
