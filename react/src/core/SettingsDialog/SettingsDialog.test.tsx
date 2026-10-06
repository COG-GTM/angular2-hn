import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header/Header';
import { AppLayout } from '../../App';
import { renderWithProviders } from '../../test/renderWithProviders';

async function openSettings(ui = <Header />) {
    renderWithProviders(ui);
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    return screen.getByRole('dialog', { name: 'Settings' });
}

describe('SettingsDialog', () => {
    it('reflects persisted settings', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '4');
        await openSettings();

        expect(screen.getByRole('checkbox', { name: 'Open links in a new tab' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(screen.getByRole('spinbutton', { name: 'Font size:' })).toHaveValue(20);
        expect(screen.getByRole('spinbutton', { name: 'List spacing:' })).toHaveValue(4);
    });

    it('shows the three Angular themes with default selected', async () => {
        await openSettings();
        const radios = screen.getAllByRole('radio');
        expect(radios.map((r) => (r as HTMLInputElement).value)).toEqual(['default', 'night', 'amoledblack']);
        expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).not.toBeChecked();
    });

    it('toggles open-links-in-new-tab and persists it', async () => {
        await openSettings();
        const checkbox = screen.getByRole('checkbox', { name: 'Open links in a new tab' });
        await userEvent.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        await userEvent.click(checkbox);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('switches the app theme class and persists it', async () => {
        await openSettings(<AppLayout />);
        const root = screen.getByTestId('theme-root');
        expect(root).toHaveClass('default');

        await userEvent.click(screen.getByRole('radio', { name: 'Night' }));
        expect(root).toHaveClass('night');
        expect(localStorage.getItem('theme')).toBe('night');

        await userEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));
        expect(root).toHaveClass('amoledblack');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('updates and persists font size and list spacing', async () => {
        await openSettings();
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Font size:' }), { target: { value: '22' } });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'List spacing:' }), { target: { value: '7' } });
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('7');
        expect(screen.getByRole('spinbutton', { name: 'Font size:' })).toHaveValue(22);
    });

    it('closes via the close button and the keyboard', async () => {
        await openSettings();
        await userEvent.click(screen.getByRole('button', { name: 'Close settings' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        screen.getByRole('button', { name: 'Close settings' }).focus();
        await userEvent.keyboard('{Enter}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
