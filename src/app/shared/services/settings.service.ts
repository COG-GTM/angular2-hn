import { Injectable, signal } from '@angular/core';

import { Settings } from '../models/settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private readonly darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    private readonly state = signal<Settings>({
        showSettings: false,
        openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') ?? 'false'),
        theme: localStorage.getItem('theme') ?? (this.darkColorSchemeMedia.matches ? 'night' : 'default'),
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    });

    readonly settings = this.state.asReadonly();

    constructor() {
        this.darkColorSchemeMedia.addEventListener('change', (event) =>
            this.setTheme(event.matches ? 'night' : 'default')
        );
    }

    toggleSettings(): void {
        this.state.update((s) => ({ ...s, showSettings: !s.showSettings }));
    }

    toggleOpenLinksInNewTab(): void {
        this.update('openLinkInNewTab', !this.state().openLinkInNewTab);
        localStorage.setItem('openLinkInNewTab', JSON.stringify(this.state().openLinkInNewTab));
    }

    setTheme(theme: string): void {
        this.update('theme', theme);
        localStorage.setItem('theme', theme);
    }

    setFont(fontSize: string): void {
        this.update('titleFontSize', fontSize);
        localStorage.setItem('titleFontSize', fontSize);
    }

    setSpacing(listSpacing: string): void {
        this.update('listSpacing', listSpacing);
        localStorage.setItem('listSpacing', listSpacing);
    }

    private update<K extends keyof Settings>(key: K, value: Settings[K]): void {
        this.state.update((s) => ({ ...s, [key]: value }));
    }
}
