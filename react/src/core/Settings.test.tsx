import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../shared/settings/SettingsContext';
import { Header } from './Header';

function renderSettings() {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Header />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Settings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete window.ga;
    });

    it('renders the popup controls and closes it with the close button', async () => {
        renderSettings();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
        await userEvent.click(screen.getByText('×'));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });

    it('toggles opening links in a new tab', async () => {
        renderSettings();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
        await userEvent.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it.each([
        ['default', 'Default'],
        ['night', 'Night'],
        ['amoledblack', 'Black (AMOLED)'],
    ])('persists the %s theme selection', async (value, label) => {
        renderSettings();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));
        const radio = screen.getByRole('radio', { name: label });
        await userEvent.click(radio);
        expect(radio).toBeChecked();
        expect(localStorage.getItem('theme')).toBe(value);
    });

    it('updates and persists the font size', async () => {
        renderSettings();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));
        const input = screen.getByRole('spinbutton', { name: /Font size/ });
        await userEvent.clear(input);
        await userEvent.type(input, '20');
        expect(input).toHaveValue(20);
        expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('updates and persists list spacing', async () => {
        renderSettings();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));
        const input = screen.getByRole('spinbutton', { name: /List spacing/ });
        await userEvent.clear(input);
        await userEvent.type(input, '5');
        expect(input).toHaveValue(5);
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });
});
