import { Settings } from '../models/settings';

class SettingsService {
  private settings: Settings = {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem("openLinkInNewTab") ? JSON.parse(localStorage.getItem("openLinkInNewTab")!) : false,
    theme: 'default',
    titleFontSize: localStorage.getItem("titleFontSize") || '16',
    listSpacing: localStorage.getItem("listSpacing") || '0',
  };

  private darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  private listeners: ((settings: Settings) => void)[] = [];

  constructor() {
    this.subscribeToSystemPreferredColorScheme();
    this.initTheme();
  }

  getSettings(): Settings {
    return { ...this.settings };
  }

  subscribe(listener: (settings: Settings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getSettings()));
  }

  private handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
    const theme = event.matches ? 'night' : 'default';
    this.setTheme(theme);
  };

  private subscribeToSystemPreferredColorScheme() {
    this.darkColorSchemeMedia.addEventListener('change', this.handleSystemPreferredColorSchemeChange);
  }

  private initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      this.settings.theme = savedTheme;
    } else {
      this.darkColorSchemeMedia.dispatchEvent(
        new MediaQueryListEvent('change', {
          media: this.darkColorSchemeMedia.media,
          matches: this.darkColorSchemeMedia.matches
        })
      );
    }
  }

  toggleSettings() {
    this.settings.showSettings = !this.settings.showSettings;
    this.notifyListeners();
  }

  toggleOpenLinksInNewTab() {
    this.settings.openLinkInNewTab = !this.settings.openLinkInNewTab;
    localStorage.setItem("openLinkInNewTab", JSON.stringify(this.settings.openLinkInNewTab));
    this.notifyListeners();
  }

  setTheme(theme: string) {
    this.settings.theme = theme;
    localStorage.setItem("theme", this.settings.theme);
    this.notifyListeners();
  }

  setFont(fontSize: string) {
    this.settings.titleFontSize = fontSize;
    localStorage.setItem("titleFontSize", this.settings.titleFontSize);
    this.notifyListeners();
  }

  setSpacing(listSpace: string) {
    this.settings.listSpacing = listSpace;
    localStorage.setItem("listSpacing", this.settings.listSpacing);
    this.notifyListeners();
  }

  destroy() {
    this.darkColorSchemeMedia.removeEventListener('change', this.handleSystemPreferredColorSchemeChange);
  }
}

export const settingsService = new SettingsService();
