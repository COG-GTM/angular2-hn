/** Theme values used by Angular (class names in `_themes.scss`). */
export const THEMES = ['default', 'night', 'amoledblack'] as const;

export type Theme = (typeof THEMES)[number];

export function isTheme(value: unknown): value is Theme {
    return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** Mirrors `src/app/shared/models/settings.ts`. Font size and spacing stay strings like Angular. */
export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: string;
    titleFontSize: string;
    listSpacing: string;
}
