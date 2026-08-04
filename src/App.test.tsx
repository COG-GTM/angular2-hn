import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('renders the app wrapper', () => {
        const { container } = render(<App />);

        expect(container.querySelector('.wrapper')).toBeInTheDocument();
    });
});
