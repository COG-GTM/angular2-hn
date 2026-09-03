import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '*',
        element: <div>Hello World</div>,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
