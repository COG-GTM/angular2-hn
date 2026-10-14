import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { routes } from '../routes';

function renderAt(path: string) {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    render(<RouterProvider router={router} />);
}

describe('Placeholder route', () => {
    it('renders the placeholder heading at the root', () => {
        renderAt('/');
        expect(screen.getByRole('heading', { name: 'React HN' })).toBeInTheDocument();
        expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('renders for any other path', () => {
        renderAt('/news/1');
        expect(screen.getByText('/news/1')).toBeInTheDocument();
    });
});
