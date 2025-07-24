import React from 'react';
import { AppRouter } from './router/AppRouter';
import { useSettings } from './hooks/useSettings';

function App() {
  const { settings } = useSettings();

  return (
    <div className={`app ${settings.theme}`} style={{
      fontSize: `${settings.titleFontSize}px`,
      '--list-spacing': `${settings.listSpacing}px`
    } as React.CSSProperties}>
      <AppRouter />
    </div>
  );
}

export default App;
