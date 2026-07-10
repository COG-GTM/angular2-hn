import React from 'react';
import ReactDOM from 'react-dom/client';

import './styles/global.scss';

function App() {
  return (
    <div className="app">
      <h1>Angular 2 HN</h1>
      <p>React + TypeScript migration &mdash; Phase 1 shell.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
