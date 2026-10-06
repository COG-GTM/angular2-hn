import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/render';
import { Header } from './Header';

async function openSettings() {
    renderWithProviders(<Header />);
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    return screen.getByRole('dialog');
}

beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
});

describe('Settings', () => {
    it('switches theme and persists it', async () => {
        await openSettings();
        expect(screen.getByLabelText('Default')).toBeChecked();
        await userEvent.click(screen.getByLabelText('Night'));
        expect(document.body).toHaveClass('night');
        expect(localStorage.getItem('theme')).toBe('night');
        await userEvent.click(screen.getByLabelText('Black (AMOLED)'));
        expect(document.body).toHaveClass('amoledblack');
        expect(document.body).not.toHaveClass('night');
    });

    it('toggles open links in a new tab', async () => {
        await openSettings();
        const checkbox = screen.getByLabelText('Open links in a new tab');
        expect(checkbox).not.toBeChecked();
        await userEvent.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('updates font size, list spacing and default feed', async () => {
        await openSettings();
        const font = screen.getByLabelText('Font size:');
        await userEvent.clear(font);
        await userEvent.type(font, '20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        const spacing = screen.getByLabelText('List spacing:');
        await userEvent.clear(spacing);
        await userEvent.type(spacing, '6');
        expect(localStorage.getItem('listSpacing')).toBe('6');

        await userEvent.selectOptions(screen.getByLabelText('Open on:'), 'show');
        expect(localStorage.getItem('defaultFeed')).toBe('show');
    });

    it('closes from the close button and Escape key', async () => {
        await openSettings();
        await userEvent.click(screen.getByRole('button', { name: 'Close settings' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        await userEvent.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
