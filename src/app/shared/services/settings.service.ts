import { Injectable, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Settings } from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements OnDestroy {
  settings: Settings = {
    showSettings : false,
    openLinkInNewTab: this.getFromLocalStorage('openLinkInNewTab', false),
    theme: 'default',
    titleFontSize: this.getFromLocalStorage('titleFontSize', '16'),
    listSpacing: this.getFromLocalStorage('listSpacing', '0'),
    useFirebaseSDK: this.getFromLocalStorage('useFirebaseSDK', false),
  };

  darkColorSchemeMedia: MediaQueryList;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
      this.subscribeToSystemPreferredColorScheme();
      this.initTheme();
    }
  }

  private getFromLocalStorage(key: string, defaultValue: any): any {
    if (isPlatformBrowser(this.platformId)) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
    }
    return defaultValue;
  }

  ngOnDestroy() {
    this.unSubscribeToSystemPrefferedColorScheme();
  }

  handleSystemPreferredColorSchemeChange(event: MediaQueryListEvent) {
    let theme;
    if (event.matches) {
      theme = 'night';
    } else {
      theme = 'default';
    }
    this.setTheme(theme);
  }

  subscribeToSystemPreferredColorScheme() {
    this.darkColorSchemeMedia.addEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange.bind(this)
    );
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
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

  unSubscribeToSystemPrefferedColorScheme() {
    this.darkColorSchemeMedia.removeEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange.bind(this)
    );
  }

  toggleSettings() {
    this.settings.showSettings = !this.settings.showSettings;
  }

  toggleOpenLinksInNewTab() {
    this.settings.openLinkInNewTab = !this.settings.openLinkInNewTab;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('openLinkInNewTab', JSON.stringify(this.settings.openLinkInNewTab));
    }
  }

  setTheme(theme) {
    this.settings.theme = theme;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.settings.theme);
    }
  }

  setFont(fontSize) {
    this.settings.titleFontSize = fontSize;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('titleFontSize', this.settings.titleFontSize);
    }
  }

  setSpacing(listSpace) {
    this.settings.listSpacing = listSpace;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('listSpacing', this.settings.listSpacing);
    }
  }

  toggleFirebaseSDK() {
    this.settings.useFirebaseSDK = !this.settings.useFirebaseSDK;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('useFirebaseSDK', JSON.stringify(this.settings.useFirebaseSDK));
    }
  }
}
