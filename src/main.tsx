import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/styles.scss';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div className="wrapper" />
    </StrictMode>
);
