import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSettings } from '../../shared/settings';
import { renderWithProviders } from '../../shared/test-utils';
import { Settings } from './Settings';

/** Shows the popup the way Header does, so closing can be asserted. */
function Harness() {
    const { settings, toggleSettings } = useSettings();
    return (
        <>
            <button onClick={toggleSettings}>open</button>
            {settings.showSettings && <Settings />}
        </>
    );
}

async function renderOpen() {
    const result = renderWithProviders(<Harness />);
    await result.user.click(screen.getByRole('button', { name: 'open' }));
    return result;
}

describe('Settings', () => {
    it('renders the Angular structure: #popup1.overlay > .popup dialog with title, × and sections', async () => {
        const { container } = await renderOpen();
        const overlay = container.querySelector('#popup1.overlay');
        expect(overlay).toHaveAttribute('data-testid', 'settings');
        const dialog = screen.getByRole('dialog', { name: 'Settings' });
        expect(dialog).toHaveClass('popup');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(overlay).toContainElement(dialog);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Settings');
        expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
            'Links',
            'Select a theme',
            'Change Font',
        ]);
        expect(container.querySelectorAll('.control-section')).toHaveLength(3);
        expect(screen.getByRole('button', { name: 'Close settings' })).toHaveTextContent('×');
        expect(screen.getByText(/Open links in a new tab/)).toBeInTheDocument();
    });

    it('reflects stored settings', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        await renderOpen();
        expect(screen.getByRole('checkbox', { name: 'Open links in a new tab' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Default' })).not.toBeChecked();
        expect(screen.getByLabelText('Font size:')).toHaveValue(20);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(5);
    });

    it('shows Angular defaults when nothing is stored', async () => {
        await renderOpen();
        expect(screen.getByRole('checkbox')).not.toBeChecked();
        expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();
        expect(screen.getByLabelText('Font size:')).toHaveValue(16);
        expect(screen.getByLabelText('Font size:')).toHaveAttribute('min', '1');
        expect(screen.getByLabelText('List spacing:')).toHaveValue(0);
        expect(screen.getByLabelText('List spacing:')).toHaveAttribute('min', '0');
    });

    it('toggles open-links-in-new-tab and persists it as JSON', async () => {
        const { user } = await renderOpen();
        const checkbox = screen.getByRole('checkbox', { name: 'Open links in a new tab' });
        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it.each([
        ['Night', 'night'],
        ['Black (AMOLED)', 'amoledblack'],
        ['Default', 'default'],
    ])('selecting %s sets theme %s on <html> and in localStorage', async (label, value) => {
        localStorage.setItem('theme', value === 'default' ? 'night' : 'default');
        const { user } = await renderOpen();
        await user.click(screen.getByRole('radio', { name: label }));
        expect(screen.getByRole('radio', { name: label })).toBeChecked();
        expect(document.documentElement).toHaveClass(value);
        expect(localStorage.getItem('theme')).toBe(value);
    });

    it('saves font size and list spacing on change (typing and spinner)', async () => {
        const { user } = await renderOpen();
        const font = screen.getByLabelText('Font size:');
        await user.clear(font);
        await user.type(font, '22');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(font).toHaveValue(22);

        const spacing = screen.getByLabelText('List spacing:');
        // A spinner/paste edit fires only `change` (no keyup) and must still save.
        fireEvent.change(spacing, { target: { value: '2' } });
        expect(localStorage.getItem('listSpacing')).toBe('2');
        expect(spacing).toHaveValue(2);
    });

    it.each(['click', 'Enter', ' ', 'Escape'])('× closes the popup via %s', async (how) => {
        const { user } = await renderOpen();
        const close = screen.getByRole('button', { name: 'Close settings' });
        if (how === 'click') await user.click(close);
        else {
            close.focus();
            await user.keyboard(how === ' ' ? ' ' : `{${how}}`);
        }
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('focuses × on open and traps Tab / Shift+Tab inside the dialog', async () => {
        localStorage.setItem('theme', 'night');
        const { user } = await renderOpen();
        const close = screen.getByRole('button', { name: 'Close settings' });
        expect(close).toHaveFocus();

        await user.tab();
        expect(screen.getByRole('checkbox')).toHaveFocus();
        await user.tab();
        expect(screen.getByRole('radio', { name: 'Night' })).toHaveFocus();
        await user.tab();
        expect(screen.getByLabelText('Font size:')).toHaveFocus();
        await user.tab();
        expect(screen.getByLabelText('List spacing:')).toHaveFocus();
        await user.tab();
        expect(close).toHaveFocus();
        await user.tab({ shift: true });
        expect(screen.getByLabelText('List spacing:')).toHaveFocus();
    });
});
