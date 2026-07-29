import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

import { Settings, Theme } from '../models/settings';

const STORAGE_KEYS = {
    theme: 'theme',
    maskAmounts: 'maskAmounts',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private readonly state = signal<Settings>({
        showSettings: false,
        maskAmounts: localStorage.getItem(STORAGE_KEYS.maskAmounts) === 'true',
        theme: (localStorage.getItem(STORAGE_KEYS.theme) as Theme | null) ?? 'default',
        titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) ?? '16',
        listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) ?? '0',
    });

    readonly settings = this.state.asReadonly();
    readonly theme = computed(() => this.state().theme);
    readonly maskAmounts = computed(() => this.state().maskAmounts);
    readonly titleFontSize = computed(() => `${this.state().titleFontSize}px`);
    readonly rowPadding = computed(() => `calc(12px + ${this.state().listSpacing}px)`);

    private readonly darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    private readonly onColorSchemeChange = (event: MediaQueryListEvent) =>
        this.setTheme(event.matches ? 'night' : 'default');

    constructor() {
        this.darkColorSchemeMedia.addEventListener('change', this.onColorSchemeChange);
        inject(DestroyRef).onDestroy(() =>
            this.darkColorSchemeMedia.removeEventListener('change', this.onColorSchemeChange)
        );

        if (!localStorage.getItem(STORAGE_KEYS.theme) && this.darkColorSchemeMedia.matches) {
            this.setTheme('night');
        }
    }

    toggleSettings(): void {
        this.state.update((settings) => ({ ...settings, showSettings: !settings.showSettings }));
    }

    closeSettings(): void {
        this.state.update((settings) => ({ ...settings, showSettings: false }));
    }

    toggleMaskAmounts(): void {
        this.state.update((settings) => ({ ...settings, maskAmounts: !settings.maskAmounts }));
        localStorage.setItem(STORAGE_KEYS.maskAmounts, String(this.state().maskAmounts));
    }

    setTheme(theme: Theme): void {
        this.state.update((settings) => ({ ...settings, theme }));
        localStorage.setItem(STORAGE_KEYS.theme, theme);
    }

    setFont(fontSize: string): void {
        this.state.update((settings) => ({ ...settings, titleFontSize: fontSize }));
        localStorage.setItem(STORAGE_KEYS.titleFontSize, fontSize);
    }

    setSpacing(listSpacing: string): void {
        this.state.update((settings) => ({ ...settings, listSpacing }));
        localStorage.setItem(STORAGE_KEYS.listSpacing, listSpacing);
    }
}
