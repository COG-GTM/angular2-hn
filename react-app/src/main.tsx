import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { warmApiCacheOnFirstControl } from './pwa/warmApiCache';
import './styles/global.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

warmApiCacheOnFirstControl();
