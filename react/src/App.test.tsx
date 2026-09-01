import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

describe('App', () => {
    it('renders the React placeholder', () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );

        expect(screen.getByText('Angular 2 HN — React')).toBeInTheDocument();
    });
});
