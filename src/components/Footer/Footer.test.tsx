import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from './Footer'

describe('Footer', () => {
    it('renders GitHub link', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        )
        expect(screen.getByText('GitHub')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
            'href',
            'https://github.com/hdjirdeh/angular2-hn'
        )
    })
})
