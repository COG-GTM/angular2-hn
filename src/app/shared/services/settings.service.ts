import { Injectable } from '@angular/core';

import { Settings } from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  settings: Settings = {
    showSettings : false,
    openLinkInNewTab: localStorage.getItem("openLinkInNewTab") ? JSON.parse(localStorage.getItem("openLinkInNewTab")) : false,
    theme: 'default',
    themePreference: localStorage.getItem('theme') ? localStorage.getItem('theme') : 'system',
    titleFontSize: localStorage.getItem("titleFontSize") ? localStorage.getItem("titleFontSize") : '16',
    listSpacing: localStorage.getItem("listSpacing") ? localStorage.getItem("listSpacing") : '0',
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
    if (this.settings.themePreference === 'system') {
      this.settings.theme = event.matches ? 'night' : 'default';
    }
  }
  
  subscribeToSystemPreferredColorScheme() {
    this.darkColorSchemeMedia.addEventListener(
      'change',
      this.handleSystemPreferredColorSchemeChange.bind(this)
    );
  }

  initTheme() {
    this.applyThemePreference(this.settings.themePreference);
  }

  applyThemePreference(preference: string) {
    if (preference === 'system') {
      this.settings.theme = this.darkColorSchemeMedia.matches ? 'night' : 'default';
    } else {
      this.settings.theme = preference;
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

  setTheme(preference) {
    this.settings.themePreference = preference;
    if (preference === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', preference);
    }
    this.applyThemePreference(preference);
  }

  setFont(fontSize){
    this.settings.titleFontSize = fontSize;
    localStorage.setItem("titleFontSize", this.settings.titleFontSize);
  }

  setSpacing(listSpace){
    this.settings.listSpacing = listSpace;
    localStorage.setItem("listSpacing", this.settings.listSpacing);
  }
}
