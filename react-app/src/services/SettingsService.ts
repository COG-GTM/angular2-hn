import { BehaviorSubject } from 'rxjs';
import { Settings } from '../models/Settings';

class SettingsService {
  private settingsSubject = new BehaviorSubject<Settings>({
    showSettings: false,
    openLinkInNewTab: localStorage.getItem("openLinkInNewTab") ? JSON.parse(localStorage.getItem("openLinkInNewTab")!) : false,
    theme: 'default',
    titleFontSize: localStorage.getItem("titleFontSize") || '16',
    listSpacing: localStorage.getItem("listSpacing") || '0',
  });

  public settings$ = this.settingsSubject.asObservable();
  private darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.subscribeToSystemPreferredColorScheme();
    this.initTheme();
  }

  get currentSettings(): Settings {
    return this.settingsSubject.value;
  }

  private handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
    const theme = event.matches ? 'night' : 'default';
    this.setTheme(theme);
  };

  private subscribeToSystemPreferredColorScheme() {
    this.darkColorSchemeMedia.addEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange
    );
  }

  private initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      this.updateSettings({ theme: savedTheme });
    } else {
      this.darkColorSchemeMedia.dispatchEvent(
        new MediaQueryListEvent('change', {
          media: this.darkColorSchemeMedia.media,
          matches: this.darkColorSchemeMedia.matches
        })
      );
    }
  }

  private unSubscribeToSystemPreferredColorScheme() {
    this.darkColorSchemeMedia.removeEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange
    );
  }

  private updateSettings(updates: Partial<Settings>) {
    const currentSettings = this.settingsSubject.value;
    const newSettings = { ...currentSettings, ...updates };
    this.settingsSubject.next(newSettings);
  }

  toggleSettings() {
    const current = this.settingsSubject.value;
    this.updateSettings({ showSettings: !current.showSettings });
  }

  toggleOpenLinksInNewTab() {
    const current = this.settingsSubject.value;
    const newValue = !current.openLinkInNewTab;
    this.updateSettings({ openLinkInNewTab: newValue });
    localStorage.setItem("openLinkInNewTab", JSON.stringify(newValue));
  }

  setTheme(theme: string) {
    this.updateSettings({ theme });
    localStorage.setItem("theme", theme);
  }

  setFont(fontSize: string) {
    this.updateSettings({ titleFontSize: fontSize });
    localStorage.setItem("titleFontSize", fontSize);
  }

  setSpacing(listSpace: string) {
    this.updateSettings({ listSpacing: listSpace });
    localStorage.setItem("listSpacing", listSpace);
  }

  destroy() {
    this.unSubscribeToSystemPreferredColorScheme();
  }
}

export const settingsService = new SettingsService();
