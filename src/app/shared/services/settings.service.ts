import { Injectable, OnDestroy, signal } from '@angular/core';

import { Settings, Theme } from '../models/settings';

@Injectable({ providedIn: 'root' })
export class SettingsService implements OnDestroy {
  private readonly darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly state = signal<Settings>({
    showSettings: false,
    openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') ?? 'false'),
    theme: (localStorage.getItem('theme') as Theme | null) ?? (this.darkColorSchemeMedia.matches ? 'night' : 'default'),
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  });

  readonly settings = this.state.asReadonly();

  private readonly onColorSchemeChange = (event: MediaQueryListEvent) =>
    this.setTheme(event.matches ? 'night' : 'default');

  constructor() {
    this.darkColorSchemeMedia.addEventListener('change', this.onColorSchemeChange);
  }

  ngOnDestroy() {
    this.darkColorSchemeMedia.removeEventListener('change', this.onColorSchemeChange);
  }

  toggleSettings() {
    this.state.update(s => ({ ...s, showSettings: !s.showSettings }));
  }

  toggleOpenLinksInNewTab() {
    this.state.update(s => ({ ...s, openLinkInNewTab: !s.openLinkInNewTab }));
    localStorage.setItem('openLinkInNewTab', JSON.stringify(this.state().openLinkInNewTab));
  }

  setTheme(theme: Theme) {
    this.state.update(s => ({ ...s, theme }));
    localStorage.setItem('theme', theme);
  }

  setFont(titleFontSize: string) {
    this.state.update(s => ({ ...s, titleFontSize }));
    localStorage.setItem('titleFontSize', titleFontSize);
  }

  setSpacing(listSpacing: string) {
    this.state.update(s => ({ ...s, listSpacing }));
    localStorage.setItem('listSpacing', listSpacing);
  }
}
