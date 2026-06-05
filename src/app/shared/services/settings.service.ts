import { Injectable, OnDestroy } from '@angular/core';

import { Settings } from '../models/settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService implements OnDestroy {
  settings: Settings;

  darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const titleFontSize = localStorage.getItem('titleFontSize');
    const listSpacing = localStorage.getItem('listSpacing');

    this.settings = {
      showSettings: false,
      openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
      theme: 'default',
      titleFontSize: titleFontSize ?? '16',
      listSpacing: listSpacing ?? '0',
    };

    this.subscribeToSystemPreferredColorScheme();
    this.initTheme();
  }

  ngOnDestroy(): void {
    this.unSubscribeToSystemPrefferedColorScheme();
  }

  handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent): void => {
    const theme = event.matches ? 'night' : 'default';
    this.setTheme(theme);
  };

  subscribeToSystemPreferredColorScheme(): void {
    this.darkColorSchemeMedia.addEventListener('change', this.handleSystemPreferredColorSchemeChange);
  }

  initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.settings.theme = savedTheme;
    } else {
      this.darkColorSchemeMedia.dispatchEvent(
        new MediaQueryListEvent('change', {
          media: this.darkColorSchemeMedia.media,
          matches: this.darkColorSchemeMedia.matches,
        })
      );
    }
  }

  unSubscribeToSystemPrefferedColorScheme(): void {
    this.darkColorSchemeMedia.removeEventListener('change', this.handleSystemPreferredColorSchemeChange);
  }

  toggleSettings(): void {
    this.settings.showSettings = !this.settings.showSettings;
  }

  toggleOpenLinksInNewTab(): void {
    this.settings.openLinkInNewTab = !this.settings.openLinkInNewTab;
    localStorage.setItem('openLinkInNewTab', JSON.stringify(this.settings.openLinkInNewTab));
  }

  setTheme(theme: string): void {
    this.settings.theme = theme;
    localStorage.setItem('theme', this.settings.theme);
  }

  setFont(fontSize: string): void {
    this.settings.titleFontSize = fontSize;
    localStorage.setItem('titleFontSize', this.settings.titleFontSize);
  }

  setSpacing(listSpace: string): void {
    this.settings.listSpacing = listSpace;
    localStorage.setItem('listSpacing', this.settings.listSpacing);
  }
}
