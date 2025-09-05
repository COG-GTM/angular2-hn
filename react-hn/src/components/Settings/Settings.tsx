import { useSettings } from '../../contexts/SettingsContext';

export function Settings() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

  if (!settings.showSettings) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white border border-gray-300 p-6 max-w-md w-11/12 max-h-4/5 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-normal">Settings</h2>
          <button onClick={toggleSettings} className="bg-transparent border-none text-2xl cursor-pointer text-gray-600">×</button>
        </div>
        
        <div>
          <div className="mb-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={settings.openLinkInNewTab}
                onChange={toggleOpenLinksInNewTab}
                className="mr-2"
              />
              Open links in new tab
            </label>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm">Theme:</label>
            <select 
              value={settings.theme} 
              onChange={(e) => setTheme(e.target.value)}
              className="ml-2 p-1 border border-gray-300"
            >
              <option value="default">Default</option>
              <option value="night">Night</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm">Title font size:</label>
            <select 
              value={settings.titleFontSize} 
              onChange={(e) => setFont(e.target.value)}
              className="ml-2 p-1 border border-gray-300"
            >
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm">List spacing:</label>
            <select 
              value={settings.listSpacing} 
              onChange={(e) => setSpacing(e.target.value)}
              className="ml-2 p-1 border border-gray-300"
            >
              <option value="0">Compact</option>
              <option value="5">Normal</option>
              <option value="10">Spacious</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
