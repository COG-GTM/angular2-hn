import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loader from './Loader';

describe('Loader', () => {
    it('renders the "Loading..." text', () => {
        render(<Loader />);
        expect(screen.getByText('Loading...')).toBeTruthy();
    });
});
