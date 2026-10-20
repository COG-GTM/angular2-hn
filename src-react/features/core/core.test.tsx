import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { AppShell } from './index';

describe('core placeholders', () => {
    it('AppShell renders the layout and the settings placeholder drives the theme', async () => {
        const { container, user } = renderWithProviders(<AppShell />, { route: '/news/1' });
        expect(container.querySelector('.body-cover')).toBeInTheDocument();
        expect(container.querySelector('.wrapper')).toBeInTheDocument();
        expect(screen.getByTestId('header-placeholder')).toBeInTheDocument();
        expect(screen.getByTestId('footer-placeholder')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'settings' }));
        expect(screen.getByTestId('settings-placeholder')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'night' }));
        expect(document.documentElement).toHaveClass('night');
    });
});
