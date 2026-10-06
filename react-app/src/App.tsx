import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './settings/SettingsContext';
import { AppRoutes, ROUTER_FUTURE } from './AppRoutes';

export function App() {
  return (
    <SettingsProvider>
      <BrowserRouter future={ROUTER_FUTURE}>
        <AppRoutes />
      </BrowserRouter>
    </SettingsProvider>
  );
}
