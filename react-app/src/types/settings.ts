export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: string;
    titleFontSize: string;
    listSpacing: string;
}

/** Theme values are the CSS classes from `styles/_themes.scss` (same as Angular's settings radios). */
export const THEMES = ['default', 'night', 'amoledblack'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
    default: 'Default',
    night: 'Night',
    amoledblack: 'Black (AMOLED)',
};

export function isTheme(value: unknown): value is Theme {
    return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}
