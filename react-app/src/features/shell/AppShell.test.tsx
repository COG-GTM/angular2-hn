import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { AppShell } from './AppShell';

// Owned by the Shell child; extend/replace with real AppShell tests.
describe('AppShell', () => {
    it('renders .body-cover and .wrapper with header and footer', () => {
        const { container } = renderWithProviders(<AppShell />);
        expect(container.querySelector('.body-cover')).toBeInTheDocument();
        const wrapper = container.querySelector('.wrapper');
        expect(wrapper?.firstElementChild).toHaveAttribute('data-testid', 'header');
        expect(wrapper?.lastElementChild).toHaveAttribute('data-testid', 'footer');
        expect(screen.getByTestId('header')).toBeInTheDocument();
    });
});
