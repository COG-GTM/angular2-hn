import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { renderWithProviders } from '../test/renderWithProviders';
import Settings from './Settings';

describe('Settings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('closes the panel through the store', async () => {
        const { store } = renderWithProviders(<Settings />);
        store.toggleSettings();

        await userEvent.click(screen.getByRole('button', { name: 'Close settings' }));

        expect(store.getSettings().showSettings).toBe(false);
    });

    it('toggles opening links in a new tab', async () => {
        const { store } = renderWithProviders(<Settings />);

        await userEvent.click(screen.getByRole('checkbox', { name: /open links in a new tab/i }));

        expect(store.getSettings().openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('selects a theme', async () => {
        const { store } = renderWithProviders(<Settings />);

        expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();

        await userEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));

        expect(store.getSettings().theme).toBe('amoledblack');
        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
    });

    it('changes the title font size and the list spacing', async () => {
        const { store } = renderWithProviders(<Settings />);

        const fontSize = screen.getByRole('spinbutton', { name: /font size/i });
        await userEvent.clear(fontSize);
        await userEvent.type(fontSize, '20');
        expect(store.getSettings().titleFontSize).toBe('20');

        const spacing = screen.getByRole('spinbutton', { name: /list spacing/i });
        await userEvent.clear(spacing);
        await userEvent.type(spacing, '5');
        expect(store.getSettings().listSpacing).toBe('5');
    });
});
