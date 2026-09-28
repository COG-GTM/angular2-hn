// CHAR-33: parity test for the React port of core/footer.
// Mirrors src/app/core/footer/footer.component.html and footer.component.ts (stateless, no inputs).
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders #footer with the same text as the Angular template', () => {
    const { container } = render(<Footer />)

    const footer = container.querySelector('#footer')
    expect(footer).toBeInTheDocument()
    expect(footer?.parentElement).toHaveClass('app-footer')
    expect(footer).toHaveTextContent('Show this project some ❤ on GitHub')
  })

  it('links to the GitHub repo in a new tab with rel=noopener', () => {
    render(<Footer />)

    const link = screen.getByRole('link', { name: 'GitHub' })
    expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener')
    expect(link.closest('#footer p')).not.toBeNull()
  })
})
