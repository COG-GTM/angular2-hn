import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

describe('App', () => {
    it('redirects to the news feed', () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );

        expect(screen.getByText('news feed page 1')).toBeInTheDocument();
    });
});
