import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './react/App';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('React root element was not found');
}

createRoot(rootElement).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
