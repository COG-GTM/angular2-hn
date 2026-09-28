// CHAR-33: parity test for the React port of the Angular ErrorMessageComponent.
// Mirrors src/app/shared/components/error-message/error-message.component.html and
// src/app/shared/components/error-message/error-message.component.ts (@Input() message).
import { render } from '@testing-library/react'
import { ErrorMessage } from './ErrorMessage'

const OFFLINE_GUIDANCE =
  "If you are offline viewing, you'll need to visit this page with a network connection first before it can work offline."

describe('ErrorMessage', () => {
  it('renders the skull graphic markup inside .error-section under the app-error-message root', () => {
    const { container } = render(<ErrorMessage message="Could not load stories." />)

    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveClass('app-error-message')
    expect(root.children).toHaveLength(1)

    const section = root.firstElementChild as HTMLElement
    expect(section).toHaveClass('error-section')
    expect(Array.from(section.children).map((el) => el.tagName.toLowerCase() + '.' + el.className)).toEqual([
      'div.skull',
      'p.strong',
      'p.',
    ])

    const skull = section.querySelector(':scope > .skull') as HTMLElement
    expect(skull.innerHTML).toBe(
      '<div class="head"><div class="crack"></div></div><div class="mouth"><div class="teeth"></div></div>',
    )
  })

  it('renders the message input in p.strong', () => {
    const { container } = render(<ErrorMessage message="Could not load stories." />)

    const strong = container.querySelectorAll('.error-section p.strong')
    expect(strong).toHaveLength(1)
    expect(strong[0]).toHaveTextContent(/^Could not load stories\.$/)
  })

  it('renders the message as text, not HTML (Angular {{ }} interpolation)', () => {
    const { container } = render(<ErrorMessage message="<b>bad</b>" />)

    const strong = container.querySelector('p.strong') as HTMLElement
    expect(strong.textContent).toBe('<b>bad</b>')
    expect(strong.querySelector('b')).toBeNull()
  })

  it('renders the exact offline-guidance paragraph', () => {
    const { container } = render(<ErrorMessage message="Could not load stories." />)

    const paragraphs = container.querySelectorAll('.error-section p')
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[1]).not.toHaveClass('strong')
    expect(paragraphs[1].textContent?.replace(/\s+/g, ' ')).toBe(OFFLINE_GUIDANCE)
  })
})
