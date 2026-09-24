import { Settings } from '../shared/models/settings';

export class SettingsServiceStub {
  settings: Settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
  };

  toggleSettings = jasmine.createSpy('toggleSettings');
  toggleOpenLinksInNewTab = jasmine.createSpy('toggleOpenLinksInNewTab');
  setTheme = jasmine.createSpy('setTheme');
  setFont = jasmine.createSpy('setFont');
  setSpacing = jasmine.createSpy('setSpacing');
}
