import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import TestComponent from './components/TestComponent';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <div className="App">
          <header className="App-header" style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5' }}>
            <h1>Angular 2 HN - React</h1>
            <p>Phase 1: React Migration Complete</p>
          </header>
          <TestComponent />
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
