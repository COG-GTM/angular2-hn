import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <div>
        <h1>Angular2 HN – React Migration</h1>
        <p>Migration scaffold is ready.</p>
      </div>
    </SettingsProvider>
  );
}

export default App;
