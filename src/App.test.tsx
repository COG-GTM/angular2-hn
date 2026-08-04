import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import App from './App';
import { SettingsProvider } from './shared/services/settings-context';

function renderApp(theme?: string) {
    if (theme) {
        localStorage.setItem('theme', theme);
    }

    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={['/news/1']}>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route path="news/:page" element={<div>feed content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
});

describe('App', () => {
    it('renders the header, the routed content and the footer inside the wrapper', () => {
        const { container } = renderApp();

        const wrapper = container.querySelector('.wrapper');

        expect(wrapper).toBeInTheDocument();
        expect(wrapper).toContainElement(screen.getByAltText('Logo'));
        expect(wrapper).toContainElement(screen.getByText('feed content'));
        expect(wrapper).toContainElement(screen.getByText('GitHub'));
        expect(container.querySelector('.body-cover')).toBeInTheDocument();
    });

    it('applies the current theme class to the outer element', () => {
        const { container } = renderApp('night');

        expect(container.querySelector('.night')).toContainElement(container.querySelector('.wrapper'));
    });
});
