import { Injectable } from '@angular/core';

import { Settings } from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  settings: Settings = {
    showSettings : false,
    openLinkInNewTab: localStorage.getItem("openLinkInNewTab") ? JSON.parse(localStorage.getItem("openLinkInNewTab") || 'false') : false,
    theme: 'default',
    titleFontSize: localStorage.getItem("titleFontSize") || '16',
    listSpacing: localStorage.getItem("listSpacing") || '0',
  };

  darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  
  constructor() {
    this.subscribeToSystemPreferredColorScheme();
    this.initTheme();
  }
  
  ngOnDestroy() {
    this.unSubscribeToSystemPrefferedColorScheme();
  }

  handleSystemPreferredColorSchemeChange(event: MediaQueryListEvent) {
    let theme: string;
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
    localStorage.setItem("openLinkInNewTab", JSON.stringify(this.settings.openLinkInNewTab));
  }

  setTheme(theme: string) {
    this.settings.theme = theme;
    localStorage.setItem("theme", this.settings.theme);
  }

  setFont(fontSize: string) {
    this.settings.titleFontSize = fontSize;
    localStorage.setItem("titleFontSize", this.settings.titleFontSize);
  }

  setSpacing(listSpace: string) {
    this.settings.listSpacing = listSpace;
    localStorage.setItem("listSpacing", this.settings.listSpacing);
  }
}
