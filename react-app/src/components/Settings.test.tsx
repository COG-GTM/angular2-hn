import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithAppProviders } from '../test/fixtures'
import Settings from './Settings'

describe('Settings', () => {
  it('separates checkbox and radio inputs from their labels', () => {
    renderWithAppProviders(<Settings />)

    const controls = [screen.getByRole('checkbox'), ...screen.getAllByRole('radio')]
    for (const control of controls) {
      expect(control.nextSibling).toHaveProperty('textContent', ' ')
    }
  })
})
