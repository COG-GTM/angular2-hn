import { SettingsProvider, useSettings } from './context/SettingsContext';
import './styles/global.scss';

function AppContent() {
  const { settings } = useSettings();
  return (
    <div className={settings.theme}>
      <p>Phase 1 complete — shared layer ready.</p>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
