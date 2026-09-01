import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../shared/settings/SettingsContext';
import { Layout } from './Layout';

function renderLayout() {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Layout>child content</Layout>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Layout', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete window.ga;
    });

    it('uses the saved theme and renders the application shell', () => {
        localStorage.setItem('theme', 'night');

        const { container } = renderLayout();

        expect(container.firstElementChild).toHaveClass('night');
        expect(screen.getByRole('img', { name: 'Logo' })).toBeInTheDocument();
        expect(screen.getByText('child content')).toBeInTheDocument();
        expect(screen.getByText(/Show this project some/)).toBeInTheDocument();
    });
});
