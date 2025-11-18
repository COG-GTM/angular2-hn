import { Injectable, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Settings } from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements OnDestroy {
  settings: Settings;
  darkColorSchemeMedia: MediaQueryList | null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    const openLinkInNewTab = this.isBrowser && localStorage.getItem('openLinkInNewTab');
    const titleFontSize = this.isBrowser && localStorage.getItem('titleFontSize');
    const listSpacing = this.isBrowser && localStorage.getItem('listSpacing');
    const useFirebaseSDK = this.isBrowser && localStorage.getItem('useFirebaseSDK');

    this.settings = {
      showSettings : false,
      openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
      theme: 'default',
      titleFontSize: titleFontSize ? titleFontSize : '16',
      listSpacing: listSpacing ? listSpacing : '0',
      useFirebaseSDK: useFirebaseSDK ? JSON.parse(useFirebaseSDK) : false,
    };

    this.darkColorSchemeMedia = this.isBrowser ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    if (this.isBrowser) {
      this.subscribeToSystemPreferredColorScheme();
      this.initTheme();
    }
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
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
    if (this.isBrowser && this.darkColorSchemeMedia) {
      this.darkColorSchemeMedia.addEventListener(
        'change',
        this.handleSystemPreferredColorSchemeChange.bind(this)
      );
    }
  }

  initTheme() {
    if (!this.isBrowser) {
      return;
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.settings.theme = savedTheme;
    } else if (this.darkColorSchemeMedia) {
      this.darkColorSchemeMedia.dispatchEvent(
        new MediaQueryListEvent('change', {
          media: this.darkColorSchemeMedia.media,
          matches: this.darkColorSchemeMedia.matches
        })
      );
    }
  }

  unSubscribeToSystemPrefferedColorScheme() {
    if (this.isBrowser && this.darkColorSchemeMedia) {
      this.darkColorSchemeMedia.removeEventListener(
        'change',
        this.handleSystemPreferredColorSchemeChange.bind(this)
      );
    }
  }

  toggleSettings() {
    this.settings.showSettings = !this.settings.showSettings;
  }

  toggleOpenLinksInNewTab() {
    this.settings.openLinkInNewTab = !this.settings.openLinkInNewTab;
    if (this.isBrowser) {
      localStorage.setItem('openLinkInNewTab', JSON.stringify(this.settings.openLinkInNewTab));
    }
  }

  setTheme(theme) {
    this.settings.theme = theme;
    if (this.isBrowser) {
      localStorage.setItem('theme', this.settings.theme);
    }
  }

  setFont(fontSize) {
    this.settings.titleFontSize = fontSize;
    if (this.isBrowser) {
      localStorage.setItem('titleFontSize', this.settings.titleFontSize);
    }
  }

  setSpacing(listSpace) {
    this.settings.listSpacing = listSpace;
    if (this.isBrowser) {
      localStorage.setItem('listSpacing', this.settings.listSpacing);
    }
  }

  toggleFirebaseSDK() {
    this.settings.useFirebaseSDK = !this.settings.useFirebaseSDK;
    if (this.isBrowser) {
      localStorage.setItem('useFirebaseSDK', JSON.stringify(this.settings.useFirebaseSDK));
    }
  }
}
