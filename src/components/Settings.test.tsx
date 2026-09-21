import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { Settings } from './Settings';
import { renderWithProviders, mockMatchMedia } from '../test/utils';

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('Settings', () => {
    it('selects a theme', async () => {
        renderWithProviders(<Settings />);

        expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();

        await userEvent.click(screen.getByRole('radio', { name: 'Night' }));

        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('night');

        await userEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('toggles opening links in a new tab', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByRole('checkbox'));

        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('changes the title font size and list spacing', async () => {
        renderWithProviders(<Settings />);

        const [fontSize, listSpacing] = screen.getAllByRole('spinbutton');

        await userEvent.clear(fontSize);
        await userEvent.type(fontSize, '20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        await userEvent.clear(listSpacing);
        await userEvent.type(listSpacing, '4');
        expect(localStorage.getItem('listSpacing')).toBe('4');
    });

    it('closes the panel', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByText('×'));

        expect(screen.getByText('Settings', { selector: 'h1' })).toBeInTheDocument();
    });
});
