import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SettingsProvider } from '../../context/SettingsContext'
import { Header } from './Header'

function renderHeader() {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Header />
            </SettingsProvider>
        </MemoryRouter>
    )
}

describe('Header', () => {
    it('renders navigation links', () => {
        renderHeader()
        expect(screen.getByText('new')).toBeInTheDocument()
        expect(screen.getByText('show')).toBeInTheDocument()
        expect(screen.getByText('ask')).toBeInTheDocument()
        expect(screen.getByText('jobs')).toBeInTheDocument()
    })

    it('renders settings icon', () => {
        renderHeader()
        expect(screen.getByAltText('Settings')).toBeInTheDocument()
    })

    it('renders logo', () => {
        renderHeader()
        expect(screen.getByAltText('Logo')).toBeInTheDocument()
    })
})
