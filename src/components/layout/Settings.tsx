import { useSettings } from '../../context/SettingsContext';
import './Settings.scss';

export default function Settings() {
  const { settings, dispatch } = useSettings();

  if (!settings.showSettings) return null;

  const closeSettings = () => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  };

  const selectTheme = (theme: string) => {
    dispatch({ type: 'SET_THEME', theme });
  };

  const changeTitleFont = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FONT', size: Number(e.target.value) });
  };

  const changeSpacing = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SPACING', spacing: Number(e.target.value) });
  };

  return (
    <div className="settings-overlay" onClick={closeSettings}>
      <div className="settings-popup" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="close-btn" onClick={closeSettings}>&times;</button>
        </div>

        <div className="settings-section">
          <label>Theme</label>
          <div className="theme-options">
            <button
              className={`theme-btn ${settings.theme === 'default' ? 'active' : ''}`}
              onClick={() => selectTheme('default')}
            >
              Default
            </button>
            <button
              className={`theme-btn ${settings.theme === 'night' ? 'active' : ''}`}
              onClick={() => selectTheme('night')}
            >
              Night
            </button>
            <button
              className={`theme-btn ${settings.theme === 'amoledblack' ? 'active' : ''}`}
              onClick={() => selectTheme('amoledblack')}
            >
              AMOLED Black
            </button>
          </div>
        </div>

        <div className="settings-section">
          <label>
            <input
              type="checkbox"
              checked={settings.openLinkInNewTab}
              onChange={() => dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' })}
            />
            Open links in new tab
          </label>
        </div>

        <div className="settings-section">
          <label>Title Font Size: {settings.titleFontSize}px</label>
          <input
            type="range"
            min="12"
            max="24"
            value={settings.titleFontSize}
            onChange={changeTitleFont}
          />
        </div>

        <div className="settings-section">
          <label>List Spacing: {settings.listSpacing}px</label>
          <input
            type="range"
            min="0"
            max="20"
            value={settings.listSpacing}
            onChange={changeSpacing}
          />
        </div>
      </div>
    </div>
  );
}
