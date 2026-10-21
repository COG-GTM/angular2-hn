import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import { SettingsProvider } from './settings';

function renderApp() {
  const router = createMemoryRouter([{ path: '/', element: <App />, children: [{ index: true, element: <p>page</p> }] }]);
  return render(
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  );
}

describe('App layout', () => {
  it('renders the routed page inside the themed wrapper', () => {
    renderApp();
    const root = screen.getByTestId('app-root');
    expect(root).toHaveClass('default');
    expect(root.querySelector('.body-cover')).toBeInTheDocument();
    expect(root.querySelector('.wrapper')).toContainElement(screen.getByText('page'));
  });

  it('applies the saved theme class', () => {
    localStorage.setItem('theme', 'amoledblack');
    renderApp();
    expect(screen.getByTestId('app-root')).toHaveClass('amoledblack');
  });
});
