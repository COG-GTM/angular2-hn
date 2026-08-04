import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSettings } from '../../shared/services/settings-context';
import { renderWithProviders } from '../../test-utils';
import Settings from './Settings';

function ShowSettingsProbe() {
    const { showSettings } = useSettings();

    return <span data-testid="show-settings">{String(showSettings)}</span>;
}

beforeEach(() => {
    localStorage.clear();
});

describe('Settings', () => {
    it('renders the popup with the current settings', () => {
        const { container } = renderWithProviders(<Settings />);

        expect(container.querySelector('#popup1.overlay .popup')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).not.toBeChecked();
        expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();
        expect(screen.getByLabelText('Font size:')).toHaveValue(16);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(0);
    });

    it('toggles opening links in a new tab', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Settings />);

        await user.click(screen.getByRole('checkbox'));

        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('selects a theme', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Settings />);

        await user.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));

        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Default' })).not.toBeChecked();
        expect(localStorage.getItem('theme')).toBe('amoledblack');

        await user.click(screen.getByRole('radio', { name: 'Night' }));

        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('changes the font size and the list spacing', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Settings />);

        const fontSize = screen.getByLabelText('Font size:');
        await user.clear(fontSize);
        await user.type(fontSize, '20');

        expect(fontSize).toHaveValue(20);
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        const listSpacing = screen.getByLabelText('List spacing:');
        await user.clear(listSpacing);
        await user.type(listSpacing, '8');

        expect(listSpacing).toHaveValue(8);
        expect(localStorage.getItem('listSpacing')).toBe('8');
    });

    it('toggles the settings dialog through the context when closed', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(
            <>
                <Settings />
                <ShowSettingsProbe />
            </>
        );

        expect(screen.getByTestId('show-settings')).toHaveTextContent('false');

        await user.click(container.querySelector('.close') as Element);

        expect(screen.getByTestId('show-settings')).toHaveTextContent('true');
    });
});
