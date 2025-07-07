import React from 'react';
import { useSettings } from '../../shared/contexts/SettingsContext';

const Settings: React.FC = () => {
  const { 
    settings, 
    toggleSettings, 
    toggleOpenLinksInNewTab, 
    setTheme, 
    setFont, 
    setSpacing 
  } = useSettings();

  if (!settings.showSettings) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button 
            onClick={toggleSettings}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select 
              value={settings.theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="default">Default</option>
              <option value="night">Night</option>
              <option value="black">Black (AMOLED)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title Font Size
            </label>
            <select 
              value={settings.titleFontSize}
              onChange={(e) => setFont(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="14">Small (14px)</option>
              <option value="16">Medium (16px)</option>
              <option value="18">Large (18px)</option>
              <option value="20">Extra Large (20px)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List Spacing
            </label>
            <select 
              value={settings.listSpacing}
              onChange={(e) => setSpacing(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="0">Compact</option>
              <option value="4">Normal</option>
              <option value="8">Comfortable</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="openInNewTab"
              checked={settings.openLinkInNewTab}
              onChange={toggleOpenLinksInNewTab}
              className="mr-2"
            />
            <label htmlFor="openInNewTab" className="text-sm text-gray-700">
              Open links in new tab
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={toggleSettings}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
