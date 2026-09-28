// CHAR-33: parity test for src/app/shared/components/loader/loader.component.{html,ts}
// (stateless component; the template renders .loading-section > .loader with "Loading...").
import { render } from '@testing-library/react'
import { Loader } from './Loader'

describe('Loader', () => {
  it('renders the .loading-section > .loader element with the text "Loading..."', () => {
    const { container } = render(<Loader />)

    const root = container.firstElementChild
    expect(root).toHaveClass('app-loader')

    const section = root?.firstElementChild
    expect(section).toHaveClass('loading-section')
    expect(section?.children).toHaveLength(1)

    const loader = section?.firstElementChild
    expect(loader).toHaveClass('loader')
    expect(loader).toHaveTextContent(/^Loading\.\.\.$/)
    expect(container.querySelectorAll('.loading-section > .loader')).toHaveLength(1)
  })
})
