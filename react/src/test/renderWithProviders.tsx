import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SettingsProvider } from '../settings'

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  path?: string
}

// Renders `ui` inside the same providers the app shell uses. Pass `path` (e.g. "/item/:id") together
// with `route` (e.g. "/item/42") to exercise components that read route params.
export function renderWithProviders(ui: ReactElement, { route = '/', path, ...options }: Options = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SettingsProvider>
      <MemoryRouter initialEntries={[route]}>
        {path ? (
          <Routes>
            <Route path={path} element={children} />
          </Routes>
        ) : (
          children
        )}
      </MemoryRouter>
    </SettingsProvider>
  )
  return render(ui, { wrapper, ...options })
}
