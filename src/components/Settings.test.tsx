import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from './Settings';
import { Settings as SettingsModel } from '../models';
import * as SettingsContext from '../context/SettingsContext';

const toggleSettings = vi.fn();
const toggleOpenLinksInNewTab = vi.fn();
const setTheme = vi.fn();
const setFont = vi.fn();
const setSpacing = vi.fn();

const settings: SettingsModel = {
    showSettings: true,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
};

beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(SettingsContext, 'useSettings').mockReturnValue({
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
    });
});

describe('Settings', () => {
    it('closes the panel via the × control', () => {
        render(<Settings />);
        fireEvent.click(screen.getByText('×'));
        expect(toggleSettings).toHaveBeenCalled();
    });

    it('toggles "open links in a new tab" via the checkbox', () => {
        render(<Settings />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    it('selects a theme via the radios', () => {
        render(<Settings />);
        fireEvent.click(screen.getByLabelText('Night'));
        expect(setTheme).toHaveBeenCalledWith('night');

        fireEvent.click(screen.getByLabelText('Black (AMOLED)'));
        expect(setTheme).toHaveBeenCalledWith('amoledblack');
    });

    it('reflects the current theme in the checked radio', () => {
        render(<Settings />);
        const defaultRadio = screen.getByLabelText('Default') as HTMLInputElement;
        expect(defaultRadio.checked).toBe(true);
    });

    it('updates font size and list spacing on change', () => {
        render(<Settings />);

        fireEvent.change(screen.getByLabelText(/Font size:/), { target: { value: '20' } });
        expect(setFont).toHaveBeenCalledWith('20');

        fireEvent.change(screen.getByLabelText(/List spacing:/), { target: { value: '5' } });
        expect(setSpacing).toHaveBeenCalledWith('5');
    });
});
