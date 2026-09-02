import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsProvider, useSettings } from '../settings';
import { mockMatchMedia } from '../test/matchMedia';
import { Settings } from './Settings';

function ShowSettingsFlag() {
    const { settings } = useSettings();
    return <span data-testid="show-settings">{String(settings.showSettings)}</span>;
}

function renderSettings() {
    return render(
        <SettingsProvider>
            <Settings />
            <ShowSettingsFlag />
        </SettingsProvider>
    );
}

describe('Settings', () => {
    beforeEach(() => {
        localStorage.clear();
        mockMatchMedia(false);
    });

    it('renders the popup structure', () => {
        const { container } = renderSettings();
        expect(container.querySelector('#popup1.overlay .popup h1')).toHaveTextContent('Settings');
        expect(container.querySelector('.popup .close')).toHaveTextContent('×');
        expect(container.querySelectorAll('.content .control-section')).toHaveLength(3);
        expect(screen.getByText('Links')).toBeInTheDocument();
        expect(screen.getByText('Select a theme')).toBeInTheDocument();
        expect(screen.getByText('Change Font')).toBeInTheDocument();
    });

    it('closes via the × control', async () => {
        const user = userEvent.setup();
        renderSettings();
        expect(screen.getByTestId('show-settings')).toHaveTextContent('false');
        await user.click(screen.getByText('×'));
        expect(screen.getByTestId('show-settings')).toHaveTextContent('true');
    });

    it('toggles the open-links checkbox and persists it', async () => {
        const user = userEvent.setup();
        renderSettings();
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('selects each theme radio and persists it', async () => {
        const user = userEvent.setup();
        renderSettings();
        const defaultRadio = screen.getByRole('radio', { name: 'Default' });
        const nightRadio = screen.getByRole('radio', { name: 'Night' });
        const amoledRadio = screen.getByRole('radio', { name: 'Black (AMOLED)' });

        expect(defaultRadio).toHaveAttribute('value', 'default');
        expect(nightRadio).toHaveAttribute('value', 'night');
        expect(amoledRadio).toHaveAttribute('value', 'amoledblack');
        expect(defaultRadio).toBeChecked();

        await user.click(nightRadio);
        expect(nightRadio).toBeChecked();
        expect(defaultRadio).not.toBeChecked();
        expect(localStorage.getItem('theme')).toBe('night');

        await user.click(amoledRadio);
        expect(amoledRadio).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('amoledblack');

        await user.click(defaultRadio);
        expect(defaultRadio).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('updates font size and list spacing and persists them', async () => {
        const user = userEvent.setup();
        renderSettings();
        const fontInput = screen.getByLabelText('Font size:');
        const spacingInput = screen.getByLabelText('List spacing:');

        expect(fontInput).toHaveAttribute('type', 'number');
        expect(fontInput).toHaveAttribute('min', '1');
        expect(fontInput).toHaveValue(16);
        expect(spacingInput).toHaveAttribute('type', 'number');
        expect(spacingInput).toHaveAttribute('min', '0');
        expect(spacingInput).toHaveValue(0);

        await user.clear(fontInput);
        await user.type(fontInput, '20');
        expect(fontInput).toHaveValue(20);
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        await user.clear(spacingInput);
        await user.type(spacingInput, '5');
        expect(spacingInput).toHaveValue(5);
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('reflects persisted store values on mount', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '3');
        renderSettings();
        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
        expect(screen.getByLabelText('Font size:')).toHaveValue(22);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(3);
    });
});
