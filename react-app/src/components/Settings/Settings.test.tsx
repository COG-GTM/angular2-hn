import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SettingsProvider, useSettings } from '../../context/SettingsContext';
import { Settings } from './Settings';

function Probe() {
    return <span data-testid="theme">{useSettings().settings.theme}</span>;
}

describe('Settings', () => {
    it('persists selected theme', () => {
        localStorage.clear();
        render(<MemoryRouter><SettingsProvider><Settings /><Probe /></SettingsProvider></MemoryRouter>);
        fireEvent.click(screen.getByLabelText('Night'));
        expect(localStorage.getItem('theme')).toBe('night');
        expect(screen.getByTestId('theme')).toHaveTextContent('night');
    });
});
