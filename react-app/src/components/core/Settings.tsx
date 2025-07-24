import React from 'react';
import { useSettings } from '../../hooks/useSettings';

interface SettingsProps {
  className?: string;
}

export const Settings: React.FC<SettingsProps> = ({ className = '' }) => {
  const { settings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

  if (!settings.showSettings) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${className}`}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Open links in new tab</label>
            <input
              type="checkbox"
              checked={settings.openLinkInNewTab}
              onChange={toggleOpenLinksInNewTab}
              className="rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="default">Default</option>
              <option value="night">Night</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title Font Size</label>
            <select
              value={settings.titleFontSize}
              onChange={(e) => setFont(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">List Spacing</label>
            <select
              value={settings.listSpacing}
              onChange={(e) => setSpacing(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="0">Compact</option>
              <option value="4">Normal</option>
              <option value="8">Spacious</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
