import { Settings } from '../models';

export function readInitialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab') as string)
            : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function resolveInitialTheme(saved: string | null, prefersDark: boolean): string {
    return saved ?? (prefersDark ? 'night' : 'default');
}
